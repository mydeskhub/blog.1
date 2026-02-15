import TiptapImage from "@tiptap/extension-image";

export type ImageAlignment = "center" | "wide" | "full" | "left" | "right";

export const CustomImage = TiptapImage.extend({
  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute("src"),
        renderHTML: (attributes: Record<string, unknown>) => ({
          src: attributes.src as string,
        }),
      },
      alt: {
        default: "",
        parseHTML: (element: HTMLElement) => element.getAttribute("alt") ?? "",
        renderHTML: (attributes: Record<string, unknown>) => ({
          alt: attributes.alt as string,
        }),
      },
      title: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute("title"),
        renderHTML: (attributes: Record<string, unknown>) => {
          if (!attributes.title) return {};
          return { title: attributes.title as string };
        },
      },
      "data-align": {
        default: "center",
        parseHTML: (element: HTMLElement) =>
          element.getAttribute("data-align") ?? "center",
        renderHTML: (attributes: Record<string, unknown>) => ({
          "data-align": attributes["data-align"] as string,
        }),
      },
      "data-uploading": {
        default: null,
        renderHTML: (attributes: Record<string, unknown>) => {
          if (!attributes["data-uploading"]) return {};
          return { "data-uploading": "true" };
        },
      },
    };
  },
});
