import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchInput } from "../SearchInput";

describe("SearchInput", () => {
  test("renders with label as placeholder", () => {
    const onChange = jest.fn();
    render(
      <SearchInput
        label="Search files"
        name="file-search"
        onChange={onChange}
      />,
    );

    const input = screen.getByPlaceholderText("Search files");
    expect(input).toBeInTheDocument();
  });

  test("calls onChange when typing", () => {
    const onChange = jest.fn();
    render(<SearchInput label="Search" name="search" onChange={onChange} />);

    const input = screen.getByPlaceholderText("Search");
    fireEvent.change(input, { target: { value: "test" } });

    expect(onChange).toHaveBeenCalledWith("test");
  });

  test("updates value state when typing", () => {
    const onChange = jest.fn();
    render(<SearchInput label="Search" name="search" onChange={onChange} />);

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const input = screen.getByPlaceholderText("Search") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "hello" } });

    expect(input.value).toBe("hello");
  });

  test("calls onFocus with current value when focused", () => {
    const onChange = jest.fn();
    const onFocus = jest.fn();
    render(
      <SearchInput
        label="Search"
        name="search"
        onChange={onChange}
        onFocus={onFocus}
      />,
    );

    const input = screen.getByPlaceholderText("Search");
    fireEvent.change(input, { target: { value: "test value" } });
    fireEvent.focus(input);

    expect(onFocus).toHaveBeenCalledWith("test value");
  });

  test("calls onBlur when input loses focus", () => {
    const onChange = jest.fn();
    const onBlur = jest.fn();
    render(
      <SearchInput
        label="Search"
        name="search"
        onChange={onChange}
        onBlur={onBlur}
      />,
    );

    const input = screen.getByPlaceholderText("Search");
    fireEvent.blur(input);

    expect(onBlur).toHaveBeenCalled();
  });

  test("respects disabled prop", () => {
    const onChange = jest.fn();
    render(
      <SearchInput
        label="Search"
        name="search"
        onChange={onChange}
        disabled={true}
      />,
    );

    const input = screen.getByPlaceholderText("Search");
    expect(input).toBeDisabled();
  });

  test("is not disabled by default", () => {
    const onChange = jest.fn();
    render(<SearchInput label="Search" name="search" onChange={onChange} />);

    const input = screen.getByPlaceholderText("Search");
    expect(input).not.toBeDisabled();
  });

  test("has correct type attribute", () => {
    const onChange = jest.fn();
    render(<SearchInput label="Search" name="search" onChange={onChange} />);

    const input = screen.getByPlaceholderText("Search");
    expect(input).toHaveAttribute("type", "text");
  });

  test("has correct id attribute", () => {
    const onChange = jest.fn();
    render(<SearchInput label="Search" name="my-search" onChange={onChange} />);

    const input = screen.getByPlaceholderText("Search");
    expect(input).toHaveAttribute("id", "my-search");
  });

  test("has autocomplete off", () => {
    const onChange = jest.fn();
    render(<SearchInput label="Search" name="search" onChange={onChange} />);

    const input = screen.getByPlaceholderText("Search");
    expect(input).toHaveAttribute("autocomplete", "off");
  });

  test("handles multiple rapid changes", () => {
    const onChange = jest.fn();
    render(<SearchInput label="Search" name="search" onChange={onChange} />);

    const input = screen.getByPlaceholderText("Search");

    fireEvent.change(input, { target: { value: "a" } });
    fireEvent.change(input, { target: { value: "ab" } });
    fireEvent.change(input, { target: { value: "abc" } });

    expect(onChange).toHaveBeenCalledWith("abc");
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  test("handles empty string input", () => {
    const onChange = jest.fn();
    render(<SearchInput label="Search" name="search" onChange={onChange} />);

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const input = screen.getByPlaceholderText("Search") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "test" } });
    fireEvent.change(input, { target: { value: "" } });

    expect(input.value).toBe("");
    expect(onChange).toHaveBeenLastCalledWith("");
  });

  test("does not call onFocus when not provided", () => {
    const onChange = jest.fn();
    render(<SearchInput label="Search" name="search" onChange={onChange} />);

    const input = screen.getByPlaceholderText("Search");
    expect(() => fireEvent.focus(input)).not.toThrow();
  });

  test("does not call onBlur when not provided", () => {
    const onChange = jest.fn();
    render(<SearchInput label="Search" name="search" onChange={onChange} />);

    const input = screen.getByPlaceholderText("Search");
    expect(() => fireEvent.blur(input)).not.toThrow();
  });

  test("maintains state across multiple interactions", () => {
    const onChange = jest.fn();
    const onFocus = jest.fn();
    render(
      <SearchInput
        label="Search"
        name="search"
        onChange={onChange}
        onFocus={onFocus}
      />,
    );

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const input = screen.getByPlaceholderText("Search") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "first" } });
    expect(input.value).toBe("first");

    fireEvent.focus(input);
    expect(onFocus).toHaveBeenCalledWith("first");

    fireEvent.change(input, { target: { value: "second" } });
    expect(input.value).toBe("second");

    fireEvent.focus(input);
    expect(onFocus).toHaveBeenCalledWith("second");
  });
});
