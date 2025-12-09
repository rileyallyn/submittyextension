import * as vscode from 'vscode';
import { getClassesHtml } from './sidebarContent';
import { ApiService } from './services/apiService';
import { AuthService } from './services/authService';

export class SidebarProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;
    private apiService: ApiService;
    private authService: AuthService;
    private isInitialized: boolean = false;

    constructor(private readonly context: vscode.ExtensionContext) {
        this.apiService = ApiService.getInstance(this.context, "");
        this.authService = AuthService.getInstance(this.context);
    }

    async resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, 'src', 'webview')],
        };

        // Initially show blank screen
        webviewView.webview.html = this.getBlankHtml();

        // Initialize authentication when sidebar is opened (only once)
        if (!this.isInitialized) {
            this.isInitialized = true;
            try {
                await this.authService.initialize();

                // After authentication, fetch and display courses
                await this.loadCourses();
            } catch (error: any) {
                console.error('Authentication initialization failed:', error);
                // Error is already shown to user in authService
            }
        } else {
            // If already initialized, just load courses
            await this.loadCourses();
        }

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(
            async (message) => {
                await this.handleMessage(message, webviewView);
            },
            undefined,
            this.context.subscriptions
        );
    }

    private async loadCourses() {
        if (!this._view) {
            return;
        }

        try {
            const token = await this.authService.getAuthorizationToken();
            if (!token) {
                return;
            }

            // Show classes HTML
            this._view.webview.html = getClassesHtml(this.context);

            // Fetch and display courses
            await this.fetchAndDisplayCourses(token, this._view);
        } catch (error: any) {
            console.error('Failed to load courses:', error);
            vscode.window.showErrorMessage(`Failed to load courses: ${error.message}`);
        }
    }

    private async handleMessage(message: any, view: vscode.WebviewView) {
        switch (message.command) {
            case 'fetchAndDisplayCourses':
                const token = await this.authService.getAuthorizationToken();
                if (token) {
                    await this.fetchAndDisplayCourses(token, view);
                }
                break;
            case 'grade':
                await this.handleGrade(message.hw, view);
                break;
            default:
                vscode.window.showWarningMessage(`Unknown command: ${message.command}`);
                break;
        }
    }

    private async fetchAndDisplayCourses(token: string, view: vscode.WebviewView) {
        try {
            const courses = await this.apiService.fetchCourses(token);

            console.log("courses", courses);


            const unarchivedHtml = courses.data.unarchived_courses.length
                ? courses.data.unarchived_courses.map((course) => `
                    <button class="accordion">${sanitize(course.display_name || course.title || 'Untitled Course')}</button>
                    <div class="panel">
                        <p>HW 1 <button class="grade-button" onclick="vscode.postMessage({ command: 'grade', hw: 'HW 1' })">Grade</button></p>
                        <p>HW 2 <button class="grade-button" onclick="">Grade</button></p>
                        <p>HW 3 <button class="grade-button" onclick="">Grade</button></p>
                    </div>
                `).join('')
                : '<p>No courses found.</p>';


            view.webview.postMessage({
                command: 'displayCourses',
                data: {
                    unarchivedHtml,
                }
            });
        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to fetch courses: ${error.message}`);
            view.webview.postMessage({ command: 'error', message: `Failed to fetch courses: ${error.message}` });
        }
    }

    private async handleGrade(hw: string, view: vscode.WebviewView) {
        try {
            const gradeDetails = await this.apiService.fetchGradeDetails(hw);
            const previousAttempts = await this.apiService.fetchPreviousAttempts(hw); // Fetch previous attempts


            view.webview.postMessage({
                command: 'displayGrade',
                data: {
                    hw,
                    gradeDetails,
                    previousAttempts, // Include previous attempts
                }
            });

            // Send message to PanelProvider
            vscode.commands.executeCommand('extension.showGradePanel', {
                hw,
                gradeDetails,
                previousAttempts, // Include previous attempts
            });
        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to fetch grade details: ${error.message}`);
            view.webview.postMessage({ command: 'error', message: `Failed to fetch grade details: ${error.message}` });
        }
    }

    private getBlankHtml(): string {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Submitty</title>
                <style>
                    body {
                        font-family: var(--vscode-font-family);
                        padding: 10px;
                        color: var(--vscode-editor-foreground);
                        background-color: var(--vscode-editor-background);
                    }
                </style>
            </head>
            <body>
            </body>
            </html>
        `;
    }
}

function sanitize(str: string): string {
    return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
