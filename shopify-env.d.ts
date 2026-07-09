/// <reference types="@shopify/app-bridge-types" />

import type {
  SAppNavAttributes,
  SAppNavLinkAttributes,
  SAppWindowAttributes,
} from "@shopify/app-bridge-types";

interface SPageAttributes {
  children?: React.ReactNode;
  heading?: string;
}

declare global {
  interface Window {
    shopify?: {
      idToken: () => Promise<string>;
      resourcePicker?: (options: {
        type: "product";
        multiple?: boolean;
        action?: "select";
      }) => Promise<
        Array<{
          id: string | number;
          title?: string;
        }>
      >;
      saveBar?: {
        hide: (id: string) => Promise<void>;
        leaveConfirmation: () => Promise<void>;
        show: (id: string) => Promise<void>;
        toggle: (id: string) => Promise<void>;
      };
    };
  }

  namespace JSX {
    interface IntrinsicElements {
      "s-app-nav": SAppNavAttributes;
      "s-app-window": SAppWindowAttributes;
      "s-badge": {
        slot?: string;
        tone?: string;
        children?: React.ReactNode;
      };
      "s-button": {
        slot?: string;
        variant?: string;
        tone?: string;
        disabled?: boolean;
        onClick?: (event: Event) => void;
        children?: React.ReactNode;
      };
      "s-link": SAppNavLinkAttributes;
      "s-page": SPageAttributes;
      "ui-save-bar": {
        id?: string;
        children?: React.ReactNode;
      };
    }
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "s-app-nav": SAppNavAttributes;
      "s-app-window": SAppWindowAttributes;
      "s-badge": {
        slot?: string;
        tone?: string;
        children?: React.ReactNode;
      };
      "s-button": {
        slot?: string;
        variant?: string;
        tone?: string;
        disabled?: boolean;
        onClick?: (event: Event) => void;
        children?: React.ReactNode;
      };
      "s-link": SAppNavLinkAttributes;
      "s-page": SPageAttributes;
      "ui-save-bar": {
        id?: string;
        children?: React.ReactNode;
      };
    }
  }
}
