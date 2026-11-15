import * as vscode from 'vscode';
import { SvgExtension } from './SvgExtension.js';
export const activate = (context: vscode.ExtensionContext): void => { new SvgExtension(vscode).activate(context); };
