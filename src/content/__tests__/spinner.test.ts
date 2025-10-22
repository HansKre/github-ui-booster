import { Spinner } from "../spinner";

describe("Spinner", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    document.head.innerHTML = "";
  });

  describe("showSpinner", () => {
    test("creates and displays a spinner", () => {
      document.body.innerHTML = `<div class="parent-selector"></div>`;

      Spinner.showSpinner(".parent-selector");

      const spinner = document.querySelector(".ghuibooster__spinner");
      expect(spinner).toBeTruthy();
      expect(spinner?.classList.contains("ghuibooster__hidden")).toBe(false);
    });

    test("injects CSS when first called", () => {
      document.body.innerHTML = `<div class="parent-selector"></div>`;

      Spinner.showSpinner(".parent-selector");

      const style = document.querySelector("style");
      expect(style).toBeTruthy();
      expect(style?.textContent).toContain("ghuibooster__spinner");
      expect(style?.textContent).toContain("ghuibooster__hidden");
      expect(style?.textContent).toContain("ghuibooster__spin");
    });

    test("unhides existing spinner instead of creating new one", () => {
      document.body.innerHTML = `
        <div class="parent-selector">
          <div class="ghuibooster__spinner ghuibooster__hidden"></div>
        </div>
      `;

      Spinner.showSpinner(".parent-selector");

      const spinners = document.querySelectorAll(".ghuibooster__spinner");
      expect(spinners.length).toBe(1);
      expect(spinners[0].classList.contains("ghuibooster__hidden")).toBe(false);
    });

    test("adds additional classes to spinner", () => {
      document.body.innerHTML = `<div class="parent-selector"></div>`;

      Spinner.showSpinner(
        ".parent-selector",
        "custom-class-1",
        "custom-class-2",
      );

      const spinner = document.querySelector(".ghuibooster__spinner");
      expect(spinner?.classList.contains("custom-class-1")).toBe(true);
      expect(spinner?.classList.contains("custom-class-2")).toBe(true);
    });

    test("adds large spinner class", () => {
      document.body.innerHTML = `<div class="parent-selector"></div>`;

      Spinner.showSpinner(".parent-selector", "ghuibooster__spinner__large");

      const spinner = document.querySelector(".ghuibooster__spinner");
      expect(spinner?.classList.contains("ghuibooster__spinner__large")).toBe(
        true,
      );
    });

    test("appends spinner to parent element", () => {
      document.body.innerHTML = `
        <div class="parent-selector">
          <span>Existing child</span>
        </div>
      `;

      Spinner.showSpinner(".parent-selector");

      const parent = document.querySelector(".parent-selector");
      const spinner = parent?.querySelector(".ghuibooster__spinner");
      expect(spinner).toBeTruthy();
      expect(parent?.contains(spinner as Node)).toBe(true);
    });

    test("does nothing if parent element not found", () => {
      Spinner.showSpinner(".non-existent-selector");

      const spinner = document.querySelector(".ghuibooster__spinner");
      expect(spinner).toBeNull();
    });

    test("injects CSS with correct animation keyframes", () => {
      document.body.innerHTML = `<div class="parent-selector"></div>`;

      Spinner.showSpinner(".parent-selector");

      const style = document.querySelector("style");
      expect(style?.textContent).toContain("@keyframes ghuibooster__spin");
      expect(style?.textContent).toContain("transform: rotate(0deg)");
      expect(style?.textContent).toContain("transform: rotate(360deg)");
    });

    test("sets CSS type to text/css", () => {
      document.body.innerHTML = `<div class="parent-selector"></div>`;

      Spinner.showSpinner(".parent-selector");

      const style = document.querySelector("style");
      expect(style?.type).toBe("text/css");
    });

    test("injects CSS only once", () => {
      document.body.innerHTML = `
        <div class="parent-selector"></div>
        <div class="another-selector"></div>
      `;

      Spinner.showSpinner(".parent-selector");
      Spinner.showSpinner(".another-selector");

      const styles = document.querySelectorAll("style");
      expect(styles.length).toBe(1);
    });

    test("creates spinner with correct default styles", () => {
      document.body.innerHTML = `<div class="parent-selector"></div>`;

      Spinner.showSpinner(".parent-selector");

      const style = document.querySelector("style");
      expect(style?.textContent).toContain("width: 16px");
      expect(style?.textContent).toContain("height: 16px");
      expect(style?.textContent).toContain("border: 2px solid");
      expect(style?.textContent).toContain("border-radius: 50%");
      expect(style?.textContent).toContain("display: inline-block");
    });

    test("creates large spinner with different dimensions", () => {
      document.body.innerHTML = `<div class="parent-selector"></div>`;

      Spinner.showSpinner(".parent-selector");

      const style = document.querySelector("style");
      expect(style?.textContent).toContain("ghuibooster__spinner__large");
      expect(style?.textContent).toContain("width: 18px");
      expect(style?.textContent).toContain("height: 18px");
    });

    test("handles multiple additional classes", () => {
      document.body.innerHTML = `<div class="parent-selector"></div>`;

      Spinner.showSpinner(".parent-selector", "class1", "class2", "class3");

      const spinner = document.querySelector(".ghuibooster__spinner");
      expect(spinner?.classList.contains("class1")).toBe(true);
      expect(spinner?.classList.contains("class2")).toBe(true);
      expect(spinner?.classList.contains("class3")).toBe(true);
    });

    test("removes hidden class when showing existing spinner", () => {
      document.body.innerHTML = `
        <div class="parent-selector">
          <div class="ghuibooster__spinner ghuibooster__hidden"></div>
        </div>
      `;

      Spinner.showSpinner(".parent-selector");

      const spinner = document.querySelector(".ghuibooster__spinner");
      expect(spinner?.classList.contains("ghuibooster__hidden")).toBe(false);
    });
  });

  describe("hideSpinner", () => {
    test("hides visible spinner", () => {
      document.body.innerHTML = `
        <div class="parent-selector">
          <div class="ghuibooster__spinner"></div>
        </div>
      `;

      Spinner.hideSpinner();

      const spinner = document.querySelector(".ghuibooster__spinner");
      expect(spinner?.classList.contains("ghuibooster__hidden")).toBe(true);
    });

    test("does nothing if spinner does not exist", () => {
      document.body.innerHTML = `<div>No spinner here</div>`;

      // Should not throw
      Spinner.hideSpinner();

      const spinner = document.querySelector(".ghuibooster__spinner");
      expect(spinner).toBeNull();
    });

    test("adds hidden class to spinner", () => {
      document.body.innerHTML = `
        <div class="parent-selector">
          <div class="ghuibooster__spinner"></div>
        </div>
      `;

      Spinner.hideSpinner();

      const spinner = document.querySelector(".ghuibooster__spinner");
      expect(spinner?.classList.contains("ghuibooster__hidden")).toBe(true);
    });

    test("keeps spinner in DOM when hiding", () => {
      document.body.innerHTML = `
        <div class="parent-selector">
          <div class="ghuibooster__spinner"></div>
        </div>
      `;

      Spinner.hideSpinner();

      const spinner = document.querySelector(".ghuibooster__spinner");
      expect(spinner).toBeTruthy();
    });

    test("hides spinner with additional classes", () => {
      document.body.innerHTML = `
        <div class="parent-selector">
          <div class="ghuibooster__spinner ghuibooster__spinner__large custom-class"></div>
        </div>
      `;

      Spinner.hideSpinner();

      const spinner = document.querySelector(".ghuibooster__spinner");
      expect(spinner?.classList.contains("ghuibooster__hidden")).toBe(true);
      expect(spinner?.classList.contains("ghuibooster__spinner__large")).toBe(
        true,
      );
      expect(spinner?.classList.contains("custom-class")).toBe(true);
    });
  });

  describe("showSpinner and hideSpinner integration", () => {
    test("can show and hide spinner multiple times", () => {
      document.body.innerHTML = `<div class="parent-selector"></div>`;

      Spinner.showSpinner(".parent-selector");
      let spinner = document.querySelector(".ghuibooster__spinner");
      expect(spinner?.classList.contains("ghuibooster__hidden")).toBe(false);

      Spinner.hideSpinner();
      spinner = document.querySelector(".ghuibooster__spinner");
      expect(spinner?.classList.contains("ghuibooster__hidden")).toBe(true);

      Spinner.showSpinner(".parent-selector");
      spinner = document.querySelector(".ghuibooster__spinner");
      expect(spinner?.classList.contains("ghuibooster__hidden")).toBe(false);

      Spinner.hideSpinner();
      spinner = document.querySelector(".ghuibooster__spinner");
      expect(spinner?.classList.contains("ghuibooster__hidden")).toBe(true);
    });

    test("reuses same spinner element", () => {
      document.body.innerHTML = `<div class="parent-selector"></div>`;

      Spinner.showSpinner(".parent-selector");
      const firstSpinner = document.querySelector(".ghuibooster__spinner");

      Spinner.hideSpinner();
      Spinner.showSpinner(".parent-selector");
      const secondSpinner = document.querySelector(".ghuibooster__spinner");

      expect(firstSpinner).toBe(secondSpinner);
    });

    test("does not duplicate CSS on multiple calls", () => {
      document.body.innerHTML = `<div class="parent-selector"></div>`;

      Spinner.showSpinner(".parent-selector");
      Spinner.hideSpinner();
      Spinner.showSpinner(".parent-selector");

      const styles = document.querySelectorAll("style");
      expect(styles.length).toBe(1);
    });
  });

  describe("CSS injection", () => {
    test("appends style to head", () => {
      document.body.innerHTML = `<div class="parent-selector"></div>`;

      Spinner.showSpinner(".parent-selector");

      const head = document.getElementsByTagName("head")[0];
      const style = head.querySelector("style");
      expect(style).toBeTruthy();
    });

    test("defines hidden class with display:none", () => {
      document.body.innerHTML = `<div class="parent-selector"></div>`;

      Spinner.showSpinner(".parent-selector");

      const style = document.querySelector("style");
      expect(style?.textContent).toContain(
        ".ghuibooster__spinner.ghuibooster__hidden",
      );
      expect(style?.textContent).toContain("display: none");
    });

    test("defines animation duration", () => {
      document.body.innerHTML = `<div class="parent-selector"></div>`;

      Spinner.showSpinner(".parent-selector");

      const style = document.querySelector("style");
      expect(style?.textContent).toContain(
        "animation: ghuibooster__spin .7s linear infinite",
      );
    });

    test("sets border colors correctly", () => {
      document.body.innerHTML = `<div class="parent-selector"></div>`;

      Spinner.showSpinner(".parent-selector");

      const style = document.querySelector("style");
      expect(style?.textContent).toContain("border: 2px solid #f3f3f3");
      expect(style?.textContent).toContain("border-top: 2px solid #0d1318");
    });

    test("sets vertical alignment", () => {
      document.body.innerHTML = `<div class="parent-selector"></div>`;

      Spinner.showSpinner(".parent-selector");

      const style = document.querySelector("style");
      expect(style?.textContent).toContain("vertical-align: text-bottom");
    });

    test("sets margin-left for default spinner", () => {
      document.body.innerHTML = `<div class="parent-selector"></div>`;

      Spinner.showSpinner(".parent-selector");

      const style = document.querySelector("style");
      expect(style?.textContent).toContain("margin-left: 1rem");
    });

    test("sets align-self for large spinner", () => {
      document.body.innerHTML = `<div class="parent-selector"></div>`;

      Spinner.showSpinner(".parent-selector");

      const style = document.querySelector("style");
      expect(style?.textContent).toContain("align-self: center");
    });
  });
});
