import { newE2EPage } from "@stencil/core/testing";
import { accessible, defaults, focusable, hidden, renders, slots, t9n } from "../../tests/commonTests";
import { SLOTS } from "./resources";

const actionGroupHTML = `<calcite-action-group scale="l">
      <calcite-action id="plus" slot="menu-actions" text="Add" icon="plus"></calcite-action>
      <calcite-action id="banana" slot="menu-actions" text="Banana" icon="banana"></calcite-action>
      </calcite-action-group>`;

describe("calcite-action-group", () => {
  describe("defaults", () => {
    defaults("calcite-action-group", [
      {
        propertyName: "layout",
        defaultValue: "vertical"
      }
    ]);
  });

  describe("renders", () => {
    renders("calcite-action-group", { display: "flex" });
  });

  describe("focusable", () => {
    focusable(actionGroupHTML, { shadowFocusTargetSelector: "calcite-action" });
  });

  describe("honors hidden attribute", () => {
    hidden("calcite-action-group");
  });

  describe("accessible", () => {
    accessible(actionGroupHTML);
  });

  describe("slots", () => {
    slots("calcite-action-group", SLOTS);
  });

  it("should honor scale of expand icon", async () => {
    const page = await newE2EPage({ html: actionGroupHTML });
    const menu = await page.find(`calcite-action-group >>> calcite-action-menu`);
    expect(await menu.getProperty("scale")).toBe("l");
  });

  describe("translation support", () => {
    t9n("calcite-action-group");
  });
});