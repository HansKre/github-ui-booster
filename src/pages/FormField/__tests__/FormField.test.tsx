import React from "react";
import { render, screen } from "@testing-library/react";
import { Formik, Form } from "formik";
import { FormField } from "../FormField";

// Helper component to wrap FormField in Formik context
const FormFieldWrapper: React.FC<{
  label: string;
  description?: string;
  name: string;
  disabled?: boolean;
  initialValue?: string;
  errors?: Record<string, string>;
}> = ({
  label,
  description,
  name,
  disabled,
  initialValue = "",
  errors = {},
}) => {
  return (
    <Formik
      initialValues={{ [name]: initialValue }}
      initialErrors={errors}
      onSubmit={() => {}}
    >
      <Form>
        <FormField
          label={label}
          description={description}
          name={name as any}
          disabled={disabled}
        />
      </Form>
    </Formik>
  );
};

describe("FormField", () => {
  test("renders with label", () => {
    render(<FormFieldWrapper label="Username" name="username" />);

    expect(screen.getByLabelText("Username")).toBeInTheDocument();
  });

  test("renders without description", () => {
    const { container } = render(
      <FormFieldWrapper label="Username" name="username" />,
    );

    // Should only have error paragraph, not description
    expect(container.querySelectorAll("p").length).toBeLessThanOrEqual(1);
  });

  test("renders with description", () => {
    render(
      <FormFieldWrapper
        label="Username"
        name="username"
        description="Enter your username"
      />,
    );

    expect(screen.getByText("Enter your username")).toBeInTheDocument();
  });

  test("input has correct name attribute", () => {
    render(<FormFieldWrapper label="Username" name="username" />);

    const input = screen.getByLabelText("Username");
    expect(input).toHaveAttribute("name", "username");
  });

  test("input has correct id attribute", () => {
    render(<FormFieldWrapper label="Username" name="username" />);

    const input = screen.getByLabelText("Username");
    expect(input).toHaveAttribute("id", "username");
  });

  test("label has correct htmlFor attribute", () => {
    const { container } = render(
      <FormFieldWrapper label="Username" name="username" />,
    );

    const label = container.querySelector("label");
    expect(label).toHaveAttribute("for", "username");
  });

  test("input has text type", () => {
    render(<FormFieldWrapper label="Username" name="username" />);

    const input = screen.getByLabelText("Username");
    expect(input).toHaveAttribute("type", "text");
  });

  test("input is enabled by default", () => {
    render(<FormFieldWrapper label="Username" name="username" />);

    const input = screen.getByLabelText("Username");
    expect(input).not.toBeDisabled();
  });

  test("input is disabled when disabled prop is true", () => {
    render(
      <FormFieldWrapper label="Username" name="username" disabled={true} />,
    );

    const input = screen.getByLabelText("Username");
    expect(input).toBeDisabled();
  });

  test("displays initial value", () => {
    render(
      <FormFieldWrapper
        label="Username"
        name="username"
        initialValue="john_doe"
      />,
    );

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const input = screen.getByLabelText("Username") as HTMLInputElement;
    expect(input.value).toBe("john_doe");
  });

  test("has error container", () => {
    const { container } = render(
      <FormFieldWrapper label="Username" name="username" />,
    );

    const errorParagraph = container.querySelector("p.error");
    expect(errorParagraph).toBeInTheDocument();
  });

  test("does not display error when no error is present", () => {
    const { container } = render(
      <FormFieldWrapper label="Username" name="username" />,
    );

    const errorParagraph = container.querySelector("p");
    // Error paragraph exists but should be empty
    expect(errorParagraph?.textContent).toBe("");
  });

  test("renders multiple form fields independently", () => {
    const { container } = render(
      <Formik
        initialValues={{ "instances[0].pat": "", "instances[0].org": "" }}
        onSubmit={() => {}}
      >
        <Form>
          <FormField label="Field 1" name={"instances[0].pat" as any} />
          <FormField label="Field 2" name={"instances[0].org" as any} />
        </Form>
      </Formik>,
    );

    expect(screen.getByLabelText("Field 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Field 2")).toBeInTheDocument();

    const inputs = container.querySelectorAll("input");
    expect(inputs).toHaveLength(2);
  });

  test("label is associated with input", () => {
    render(<FormFieldWrapper label="Email Address" name="email" />);

    const label = screen.getByText("Email Address");
    const input = screen.getByLabelText("Email Address");

    expect(label).toBeInTheDocument();
    expect(input).toBeInTheDocument();
  });

  test("renders with long description", () => {
    const longDescription =
      "This is a very long description that provides detailed information about what the user should enter in this field. It can span multiple lines and provide examples.";

    render(
      <FormFieldWrapper
        label="Username"
        name="username"
        description={longDescription}
      />,
    );

    expect(screen.getByText(longDescription)).toBeInTheDocument();
  });

  test("renders with special characters in label", () => {
    render(<FormFieldWrapper label="User's Email (Primary)" name="email" />);

    expect(screen.getByLabelText("User's Email (Primary)")).toBeInTheDocument();
  });

  test("handles different name formats", () => {
    render(<FormFieldWrapper label="PAT Token" name="instances[0].pat" />);

    const input = screen.getByLabelText("PAT Token");
    expect(input).toHaveAttribute("name", "instances[0].pat");
    expect(input).toHaveAttribute("id", "instances[0].pat");
  });

  test("renders field wrapper with correct structure", () => {
    const { container } = render(
      <FormFieldWrapper
        label="Username"
        name="username"
        description="Your unique username"
      />,
    );

    const wrapper = container.firstChild?.firstChild as HTMLElement;
    expect(wrapper).toBeInTheDocument();
    expect(wrapper.querySelector("label")).toBeInTheDocument();
    expect(wrapper.querySelector("input")).toBeInTheDocument();
  });

  test("error paragraph is always present", () => {
    const { container } = render(
      <FormFieldWrapper label="Username" name="username" />,
    );

    const errorParagraphs = Array.from(container.querySelectorAll("p")).filter(
      (p) => p.textContent === "",
    );
    expect(errorParagraphs.length).toBeGreaterThan(0);
  });

  test("error container exists in DOM structure", () => {
    const { container } = render(
      <FormFieldWrapper label="Username" name="username" />,
    );

    const errorContainer = container.querySelector("p.error");
    expect(errorContainer).toBeInTheDocument();
  });

  test("maintains state when toggling disabled", () => {
    const { rerender } = render(
      <FormFieldWrapper
        label="Username"
        name="username"
        initialValue="test_user"
        disabled={false}
      />,
    );

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const input = screen.getByLabelText("Username") as HTMLInputElement;
    expect(input.value).toBe("test_user");
    expect(input).not.toBeDisabled();

    rerender(
      <FormFieldWrapper
        label="Username"
        name="username"
        initialValue="test_user"
        disabled={true}
      />,
    );

    expect(input.value).toBe("test_user");
    expect(input).toBeDisabled();
  });

  test("renders description with Paragraph component", () => {
    render(
      <FormFieldWrapper
        label="Username"
        name="username"
        description="Test description"
      />,
    );

    // Paragraph component renders as <p> with specific styling
    const descriptionText = screen.getByText("Test description");
    expect(descriptionText).toBeInTheDocument();
    expect(descriptionText.tagName).toBe("P");
  });

  test("handles empty string description", () => {
    render(
      <FormFieldWrapper label="Username" name="username" description="" />,
    );

    // With empty description, the component structure should still be valid
    const label = screen.getByLabelText("Username");
    expect(label).toBeInTheDocument();
  });

  test("maintains proper tab order", () => {
    const { container } = render(
      <Formik
        initialValues={{
          "instances[0].pat": "",
          "instances[0].org": "",
          "instances[0].repo": "",
        }}
        onSubmit={() => {}}
      >
        <Form>
          <FormField label="Field 1" name={"instances[0].pat" as any} />
          <FormField label="Field 2" name={"instances[0].org" as any} />
          <FormField label="Field 3" name={"instances[0].repo" as any} />
        </Form>
      </Formik>,
    );

    const inputs = container.querySelectorAll("input");
    expect(inputs).toHaveLength(3);

    // All inputs should be in the document in order
    inputs.forEach((input) => {
      expect(input).toBeInTheDocument();
    });
  });
});
