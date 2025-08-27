declare namespace JSX {
  interface IntrinsicElements {
    "clipboard-copy": JSX.IntrinsicElements["div"] & {
      value?: string;
      "aria-label"?: string;
      "data-copy-feedback"?: string;
      "data-view-component"?: string;
    };
  }
}
