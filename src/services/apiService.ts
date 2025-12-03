// src/services/apiService.ts

import * as vscode from 'vscode';
import { ApiClient } from './apiClient';

interface Course {
    semester: string;
    title: string;
    display_name: string;
    display_semester: string;
    user_group: number;
    registration_section: string;
}

interface ApiResponse {
    status: string;
    data: {
        unarchived_courses: Course[];
        dropped_courses: Course[];
    };
    message?: string;
}

interface LoginResponse {
    status: string;
    data: {
        token: string;
    };
    message?: string;
}

export class ApiService {
    private client: ApiClient;
    private static instance: ApiService;

    constructor(private context: vscode.ExtensionContext, apiBaseUrl: string) {
        this.client = new ApiClient(apiBaseUrl);
    }

    // set token for local api client
    setAuthorizationToken(token: string) {
        this.client.setToken(token);
    }

    // set base URL for local api client
    setBaseUrl(baseUrl: string) {
        this.client.setBaseURL(baseUrl);
    }

    /**
     * Login to the Submitty API
     */
    async login(userId: string, password: string): Promise<string> {
        try {
            const response = await this.client.post<LoginResponse>(
                '/api/token',
                {
                    user_id: userId,
                    password: password,
                },
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            );

            const token: string = response.data.data.token;
            return token;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || error.message || 'Login failed.');
        }
    }

    /**
     * Fetch all courses for the authenticated user
     */
    async fetchCourses(token: string): Promise<ApiResponse> {
        try {
            const response = await this.client.get<ApiResponse>('/api/courses', {
                headers: {
                    Authorization: token,
                },
            });
            return response.data;
        } catch (error: any) {
            console.error('Error fetching courses:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch courses.');
        }
    }

    /**
     * Fetch grade details for a specific homework assignment
     */
    async fetchGradeDetails(hw: string): Promise<any> {
        // Hardcoded grade details
        return {
            score: '25/40',
            tests: [
                { name: 'Test 1', passed: true },
                { name: 'Test 2', passed: false },
                { name: 'Test 3', passed: true },
                { name: 'Test 4', passed: false },
            ]
        };
    }

    /**
     * Fetch previous attempts for a specific homework assignment
     */
    async fetchPreviousAttempts(hw: string): Promise<any[]> {
        // Hardcoded previous attempts
        return [
            { score: '15/40', tests: [{ name: 'Test 1', passed: false }, { name: 'Test 2', passed: false }, { name: 'Test 3', passed: true }, { name: 'Test 4', passed: false }] },
            { score: '25/40', tests: [{ name: 'Test 1', passed: true }, { name: 'Test 2', passed: false }, { name: 'Test 3', passed: true }, { name: 'Test 4', passed: false }] }
        ];
    }

    static getInstance(context: vscode.ExtensionContext, apiBaseUrl: string): ApiService {
        if (!ApiService.instance) {
            ApiService.instance = new ApiService(context, apiBaseUrl);
        }
        return ApiService.instance;
    }
}