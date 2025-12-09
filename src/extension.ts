import * as vscode from 'vscode';
import { SidebarProvider } from './sidebarProvider';
import { PanelProvider } from './panelProvider';
import ReactWebview from './reactWebview';
import { ExtensionContextUtil } from './util/extensionContextUtil';

export function activate(context: vscode.ExtensionContext) {
    ExtensionContextUtil.getExtensionContext(context)
    const sidebarProvider = new SidebarProvider(context);
    const panelProvider = new PanelProvider(context);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('submittyWebview', sidebarProvider)
    );

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('submitty-panel', panelProvider)
    );

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            ReactWebview.viewType,
            ReactWebview.getInstance(context.extensionUri),
        )
    );
}

export function deactivate() { }