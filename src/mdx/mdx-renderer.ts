import { compile } from "@mdx-js/mdx";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ComponentRegistry } from "./component-registry.js";
import createDebug from "debug";

const debug = createDebug("framework:mdx-renderer");

export interface MDXRenderOptions {
  data?: Record<string, any>;
  components?: Record<string, any>;
}

export class MDXRenderer {
  private componentRegistry: ComponentRegistry;
  private initialized: boolean = false;

  constructor() {
    this.componentRegistry = new ComponentRegistry();
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.componentRegistry.ensureLoaded();
      this.initialized = true;
      debug("MDX renderer initialized");
    }
  }

  static isMDX(content: string): boolean {
    return /<[A-Z][a-zA-Z0-9]*[\s/>]/.test(content);
  }

  async render(
    mdxContent: string,
    options: MDXRenderOptions = {}
  ): Promise<string> {
    debug("Rendering MDX content (%d chars)", mdxContent.length);

    await this.ensureInitialized();

    try {
      // Compile MDX to JavaScript
      const compiled = await compile(mdxContent, {
        outputFormat: "function-body",
        development: false,
      });

      debug("MDX compiled successfully");

      // Get component map
      const components = {
        ...this.componentRegistry.getAll(),
        ...options.components,
      };

      debug("Available components: %o", Object.keys(components));

      // The compiled code expects arguments[0] to be React's JSX runtime
      const code = String(compiled.value);

      debug("Compiled code length: %d", code.length);

      // Import React's JSX runtime
      // @ts-ignore - dynamic import
      const jsxRuntime = await import("react/jsx-runtime");

      // Execute the compiled code with JSX runtime as arguments[0]
      // The function-body format expects arguments[0] to have jsx, jsxs, Fragment
      const moduleFactory = new Function(code);
      const mdxModule = moduleFactory.call(null, jsxRuntime);

      debug("MDX Module type: %s", typeof mdxModule);
      debug("MDX Module keys: %o", Object.keys(mdxModule || {}));

      // Extract the default export (the actual MDX component)
      const MDXContent = mdxModule?.default || mdxModule;

      debug("MDX Component type: %s", typeof MDXContent);

      if (typeof MDXContent !== "function") {
        throw new Error(
          `Expected MDX component to be a function, got ${typeof MDXContent}`
        );
      }

      // Render with components passed as prop
      const element = React.createElement(MDXContent, {
        components,
        ...options.data,
      });

      const html = renderToStaticMarkup(element);

      debug("Rendered to HTML (%d chars)", html.length);
      return html;
    } catch (error: any) {
      console.error("❌ MDX rendering failed:", error.message);
      debug("Full error: %O", error);
      throw new Error(`MDX rendering failed: ${error.message}`);
    }
  }

  async renderMixed(
    content: string,
    options: MDXRenderOptions = {}
  ): Promise<string> {
    if (MDXRenderer.isMDX(content)) {
      debug("Detected MDX content, using MDX renderer");
      return this.render(content, options);
    } else {
      debug("Pure markdown detected, passing through");
      return content;
    }
  }

  async getAvailableComponents(): Promise<string[]> {
    await this.ensureInitialized();
    return this.componentRegistry.listComponents();
  }

  registerComponent(name: string, component: any): void {
    this.componentRegistry.register(name, component);
  }
}
