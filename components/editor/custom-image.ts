import TiptapImage from "@tiptap/extension-image";

export type ImageAlignment = "center" | "wide" | "full" | "left" | "right";

export const CustomImage = TiptapImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      alt: {
        default: "",
        parseHTML: (element) => element.getAttribute("alt") ?? "",
        renderHTML: (attributes) => ({
          alt: attributes.alt as string,
        }),
      },
      "data-align": {
        default: "center",
        parseHTML: (element) => element.getAttribute("data-align") ?? "center",
        renderHTML: (attributes) => ({
          "data-align": attributes["data-align"] as string,
        }),
      },
    };
  },
});
