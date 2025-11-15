// src/util/ExtensionContextUtil.ts

/** 
 * Simple helper class to manage a global extension context instance.
 */
import { ExtensionContext, ExtensionMode } from 'vscode';

export class ExtensionContextUtil {
    private static instance: ExtensionContextUtil;

    private constructor(private context: ExtensionContext) {
    }

    public static getExtensionContext(ctx?: ExtensionContext): ExtensionContextUtil {
        if (!ExtensionContextUtil.instance && ctx) {
            ExtensionContextUtil.instance = new ExtensionContextUtil(ctx);
        }
        return ExtensionContextUtil.instance;
    }

    public get isProduction(): boolean {
        return this.context.extensionMode === ExtensionMode.Production;
    }
}