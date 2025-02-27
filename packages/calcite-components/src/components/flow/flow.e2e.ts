import { newE2EPage } from "@stencil/core/testing";

import { html } from "../../../support/formatting";
import { accessible, focusable, hidden, renders } from "../../tests/commonTests";
import { CSS as ITEM_CSS } from "../flow-item/resources";
import { CSS } from "./resources";
import { isElementFocused } from "../../tests/utils";
import { FlowItemLikeElement } from "./interfaces";

describe("calcite-flow", () => {
  describe("renders", () => {
    renders("calcite-flow", { display: "flex" });
  });

  describe("honors hidden attribute", () => {
    hidden("calcite-flow");
  });

  describe("is focusable", () => {
    focusable(
      html`<calcite-flow>
        <calcite-flow-item id="one" heading="one">Hello World</calcite-flow-item>
        <calcite-flow-item id="two" heading="two">Hello World</calcite-flow-item>
      </calcite-flow>`,
      {
        focusTargetSelector: "#two",
      }
    );
  });

  it("frame defaults", async () => {
    const page = await newE2EPage();

    await page.setContent("<calcite-flow></calcite-flow>");

    const element = await page.find(`calcite-flow >>> .${CSS.frame}`);

    expect(element).toHaveClass(CSS.frame);
    expect(element).not.toHaveClass(CSS.frameAdvancing);
    expect(element).not.toHaveClass(CSS.frameRetreating);
  });

  describe("works with flow-items", () => {
    it("back() method should remove item", async () => {
      const page = await newE2EPage();

      await page.setContent(`<calcite-flow><calcite-flow-item></calcite-flow-item></calcite-flow>`);

      const flow = await page.find("calcite-flow");

      await flow.callMethod("back");

      await page.waitForChanges();

      const flowItem = await page.find("calcite-flow-item");

      expect(flowItem).toBeNull();
    });

    it("should call setFocus() on back button click", async () => {
      const page = await newE2EPage();

      await page.setContent(
        html`<calcite-flow
          ><calcite-flow-item id="one"></calcite-flow-item><calcite-flow-item id="two"></calcite-flow-item
        ></calcite-flow>`
      );

      await page.$eval(
        "#two",
        (elm: HTMLCalciteFlowItemElement, backButtonCSS: string) => {
          elm.shadowRoot.querySelector<HTMLCalciteActionElement>(`.${backButtonCSS}`)?.click();
        },
        ITEM_CSS.backButton
      );
      await page.waitForChanges();

      await isElementFocused(page, "#one");
    });

    it("goes back when item back button is clicked", async () => {
      const page = await newE2EPage();
      await page.setContent(html`<calcite-flow show-back-button>
        <calcite-flow-item id="first"></calcite-flow-item>
        <calcite-flow-item id="second"></calcite-flow-item>
      </calcite-flow>`);
      await page.waitForChanges();

      let items = await page.findAll("calcite-flow-item");

      expect(items).toHaveLength(2);
      expect(items[0].id).toBe("first");
      expect(items[1].id).toBe("second");

      const activeItemBackButton = await page.find(`calcite-flow-item:last-of-type >>> .${ITEM_CSS.backButton}`);
      await activeItemBackButton.click();
      await page.waitForChanges();

      items = await page.findAll("calcite-flow-item");

      expect(items).toHaveLength(1);
      expect(items[0].id).toBe("first");
    });

    it("does not go back when item back button is clicked and defaultPrevented", async () => {
      const page = await newE2EPage();
      await page.setContent(html`<calcite-flow show-back-button>
        <calcite-flow-item id="first"></calcite-flow-item>
        <calcite-flow-item id="second"></calcite-flow-item>
      </calcite-flow>`);
      await page.waitForChanges();

      let items = await page.findAll("calcite-flow-item");

      expect(items).toHaveLength(2);
      expect(items[0].id).toBe("first");
      expect(items[1].id).toBe("second");

      await page.evaluate((backButtonSelector) => {
        const lastFlowItem = document.querySelector("calcite-flow-item:last-of-type");

        lastFlowItem?.addEventListener("calciteFlowItemBack", (event) => event.preventDefault());

        lastFlowItem?.shadowRoot.querySelector(backButtonSelector)?.click();
      }, `.${ITEM_CSS.backButton}`);
      await page.waitForChanges();

      items = await page.findAll("calcite-flow-item");
      expect(items).toHaveLength(2);
      expect(items[0].id).toBe("first");
      expect(items[1].id).toBe("second");
    });

    it("setting 'beforeBack' should be called in 'back()'", async () => {
      const page = await newE2EPage();

      const mockCallBack = jest.fn().mockReturnValue(Promise.resolve());
      await page.exposeFunction("beforeBack", mockCallBack);

      await page.setContent(`<calcite-flow><calcite-flow-item></calcite-flow-item></calcite-flow>`);

      expect(await page.findAll("calcite-flow-item")).toHaveLength(1);

      await page.$eval(
        "calcite-flow-item",
        (elm: HTMLCalciteFlowItemElement) =>
          (elm.beforeBack = (window as typeof window & Pick<typeof elm, "beforeBack">).beforeBack)
      );

      const flow = await page.find("calcite-flow");

      const backValue = await flow.callMethod("back");

      expect(backValue).toBeDefined();
      expect(mockCallBack).toHaveBeenCalledTimes(1);
      expect(await page.findAll("calcite-flow-item")).toHaveLength(0);
    });

    it("should handle rejected 'beforeBack' promise'", async () => {
      const page = await newE2EPage();

      const mockCallBack = jest.fn().mockReturnValue(() => Promise.reject());
      await page.exposeFunction("beforeBack", mockCallBack);

      await page.setContent(`<calcite-flow><calcite-flow-item></calcite-flow-item></calcite-flow>`);

      await page.$eval(
        "calcite-flow-item",
        (elm: HTMLCalciteFlowItemElement) =>
          (elm.beforeBack = (window as typeof window & Pick<typeof elm, "beforeBack">).beforeBack)
      );

      const flow = await page.find("calcite-flow");

      await flow.callMethod("back");

      expect(mockCallBack).toHaveBeenCalledTimes(1);
    });

    it("should not remove flow-item on rejected 'beforeBack' promise'", async () => {
      const page = await newE2EPage();

      await page.exposeFunction("beforeBack", () => Promise.reject());

      await page.setContent(`<calcite-flow><calcite-flow-item></calcite-flow-item></calcite-flow>`);

      expect(await page.findAll("calcite-flow-item")).toHaveLength(1);

      await page.$eval(
        "calcite-flow-item",
        (elm: HTMLCalciteFlowItemElement) =>
          (elm.beforeBack = (window as typeof window & Pick<typeof elm, "beforeBack">).beforeBack)
      );

      const flow = await page.find("calcite-flow");

      await flow.callMethod("back");

      expect(await page.findAll("calcite-flow-item")).toHaveLength(1);
    });

    it("frame advancing should add animation class", async () => {
      const page = await newE2EPage();

      await page.setContent(`<calcite-flow><calcite-flow-item></calcite-flow-item></calcite-flow>`);

      const items = await page.findAll("calcite-flow-item");

      expect(items).toHaveLength(1);

      const element = await page.find("calcite-flow");

      element.innerHTML = `<calcite-flow-item>test</calcite-flow-item><calcite-flow-item>test</calcite-flow-item>`;

      await page.waitForChanges();

      const items2 = await page.findAll("calcite-flow-item");

      expect(items2).toHaveLength(2);

      const frame = await page.find(`calcite-flow >>> .${CSS.frame}`);

      expect(frame).toHaveClass(CSS.frameAdvancing);
    });

    it("frame advancing should add animation class when subtree is modified", async () => {
      const page = await newE2EPage();

      await page.setContent(`<calcite-flow><calcite-flow-item>flow1</calcite-flow-item></calcite-flow>`);

      const element = await page.find("calcite-flow");

      element.innerHTML = `<calcite-flow-item>flow1</calcite-flow-item><calcite-flow-item id="flow2">flow2</calcite-flow-item>`;

      await page.waitForChanges();

      const item2 = await page.find(`calcite-flow-item[id=flow2]`);

      item2.innerHTML = "new flow2 subtree content";

      await page.waitForChanges();

      const frame = await page.find(`calcite-flow >>> .${CSS.frame}`);

      expect(frame).toHaveClass(CSS.frameAdvancing);
    });

    it("frame retreating should add animation class", async () => {
      const page = await newE2EPage();

      await page.setContent("<calcite-flow></calcite-flow>");

      await page.$eval("calcite-flow", (elm: HTMLElement): void => {
        elm.innerHTML = `
      <calcite-flow-item></calcite-flow-item>
      <calcite-flow-item></calcite-flow-item>
      <calcite-flow-item></calcite-flow-item>
      `;
      });

      await page.waitForChanges();

      const items = await page.findAll("calcite-flow-item");

      expect(items).toHaveLength(3);

      const frame = await page.find(`calcite-flow >>> .${CSS.frame}`);

      expect(frame).not.toHaveClass(CSS.frameRetreating);
      expect(frame).not.toHaveClass(CSS.frameAdvancing);

      await page.$eval("calcite-flow", (elm: HTMLCalciteFlowElement) => elm.back());

      await page.waitForChanges();

      const items2 = await page.findAll("calcite-flow-item");

      expect(items2).toHaveLength(2);

      const frame2 = await page.find(`calcite-flow >>> .${CSS.frame}`);

      expect(frame2).toHaveClass(CSS.frameRetreating);
      expect(frame2).not.toHaveClass(CSS.frameAdvancing);
    });

    it("frame animation class should not exist if frame count remains the same", async () => {
      const page = await newE2EPage();

      await page.setContent(
        `<calcite-flow><calcite-flow-item>test</calcite-flow-item><calcite-flow-item>test</calcite-flow-item></calcite-flow>`
      );

      const frame = await page.find(`calcite-flow >>> .${CSS.frame}`);

      expect(frame).not.toHaveClass(CSS.frameRetreating);
      expect(frame).not.toHaveClass(CSS.frameAdvancing);

      const element = await page.find("calcite-flow");

      element.innerHTML = `<calcite-flow-item>test</calcite-flow-item><calcite-flow-item>test</calcite-flow-item>`;

      await page.waitForChanges();

      expect(frame).not.toHaveClass(CSS.frameRetreating);
      expect(frame).not.toHaveClass(CSS.frameAdvancing);
    });

    it("item properties should be set", async () => {
      const page = await newE2EPage();

      await page.setContent("<calcite-flow></calcite-flow>");

      await page.$eval("calcite-flow", (elm: HTMLElement): void => {
        elm.innerHTML = `
      <calcite-flow-item></calcite-flow-item>
      <calcite-flow-item></calcite-flow-item>
      <calcite-flow-item></calcite-flow-item>
      `;
      });

      const items = await page.findAll("calcite-flow-item");

      expect(items).toHaveLength(3);

      const showBackButton0 = await items[0].getProperty("showBackButton");
      const showBackButton2 = await items[2].getProperty("showBackButton");

      expect(items[0].getAttribute("hidden")).not.toBe(null);
      expect(showBackButton0).not.toBe(null);

      expect(items[2].getAttribute("hidden")).toBe(null);
      expect(showBackButton2).not.toBe(null);
    });

    describe("accessible", () => {
      accessible(html`
        <calcite-flow>
          <calcite-flow-item> </calcite-flow-item>
          <calcite-flow-item> </calcite-flow-item>
          <calcite-flow-item> </calcite-flow-item>
        </calcite-flow>
      `);
    });

    it("should also work with descendant slotted items", async () => {
      const page = await newE2EPage();

      await page.setContent(html`<calcite-flow>
        <calcite-flow-item>Assigned item</calcite-flow-item>
        <calcite-flow-item>Assigned item</calcite-flow-item>
        <div>
          <calcite-flow-item
            >Assigned item <calcite-flow-item>Assigned item</calcite-flow-item
            ><calcite-flow><calcite-flow-item>Unassigned item</calcite-flow-item></calcite-flow></calcite-flow-item
          >
        </div>
      </calcite-flow>`);

      const items = await page.findAll("calcite-flow-item");

      expect(items).toHaveLength(5);

      expect(items[0].getAttribute("hidden")).toBe("");
      expect(await items[0].getProperty("showBackButton")).toBe(false);

      expect(items[1].getAttribute("hidden")).toBe("");
      expect(await items[1].getProperty("showBackButton")).toBe(false);

      expect(items[2].getAttribute("hidden")).toBe("");
      expect(await items[2].getProperty("showBackButton")).toBe(false);

      expect(items[3].getAttribute("hidden")).toBe(null);
      expect(await items[3].getProperty("showBackButton")).toBe(true);

      expect(items[4].getAttribute("hidden")).toBe(null);
      expect(await items[4].getProperty("showBackButton")).toBe(false);
    });
  });

  it("supports custom flow-items", async () => {
    const page = await newE2EPage();
    await page.setContent(html`
      <calcite-flow custom-item-selectors="custom-flow-item">
        <calcite-flow-item heading="flow-item-1" id="first">
          <p>😃</p>
        </calcite-flow-item>
        <custom-flow-item heading="custom-flow-item" id="second">
          <p>🥸</p>
        </custom-flow-item>
        <calcite-flow-item heading="flow-item-2" id="third">
          <p>😃</p>
        </calcite-flow-item>
      </calcite-flow>
    `);

    await page.evaluate(async () => {
      class CustomFlowItem extends HTMLElement implements FlowItemLikeElement {
        private flowItemEl: HTMLCalciteFlowItemElement;

        constructor() {
          super();
          const shadow = this.attachShadow({ mode: "open" });

          shadow.innerHTML = `
                <style>
                  :host {
                    display: flex;
                    background: #bdf2c4;
                  }
                </style>
                <calcite-flow-item id="internalFlowItem">
                  <slot></slot>
                </calcite-flow-item>
              `;

          this.flowItemEl = shadow.getElementById("internalFlowItem") as HTMLCalciteFlowItemElement;
        }

        connectedCallback(): void {
          this.flowItemEl.setAttribute("heading", this.getAttribute("heading"));
          this.flowItemEl.setAttribute("show-back-button", this.getAttribute("show-back-button"));
          this.flowItemEl.setAttribute("menu-open", this.getAttribute("menu-open"));
        }

        get heading(): string {
          return this.getAttribute("heading");
        }

        set heading(value: string) {
          this.flowItemEl.heading = value;
        }

        get hidden(): boolean {
          return this.hasAttribute("hidden");
        }

        set hidden(value: boolean) {
          this.toggleAttribute("hidden", value);
          this.flowItemEl.toggleAttribute("hidden", value);
        }

        get menuOpen(): boolean {
          return this.hasAttribute("menu-open");
        }

        set menuOpen(value: boolean) {
          this.toggleAttribute("menu-open", value);
          this.flowItemEl.menuOpen = value;
        }

        get showBackButton(): boolean {
          return this.hasAttribute("show-back-button");
        }

        set showBackButton(value: boolean) {
          this.toggleAttribute("show-back-button", value);
          this.flowItemEl.showBackButton = value;
        }

        async beforeBack(): Promise<void> {
          // no op
        }

        async setFocus(): Promise<void> {
          await this.flowItemEl.setFocus();
        }
      }

      customElements.define("custom-flow-item", CustomFlowItem);
    });

    const flow = await page.find("calcite-flow");
    const displayedItemSelector = "calcite-flow > *:not([hidden])";
    let displayedItem = await page.find(displayedItemSelector);

    expect(await flow.getProperty("childElementCount")).toBe(3);
    expect(displayedItem.id).toBe("third");

    await page.evaluate(
      async (displayedItemSelector: string, ITEM_CSS) => {
        document
          .querySelector(displayedItemSelector)
          .shadowRoot.querySelector<HTMLCalciteActionElement>(`.${ITEM_CSS.backButton}`)
          .click();
      },
      displayedItemSelector,
      ITEM_CSS
    );
    await page.waitForChanges();

    displayedItem = await page.find(displayedItemSelector);
    expect(await flow.getProperty("childElementCount")).toBe(2);
    expect(displayedItem.id).toBe("second");

    await page.evaluate(
      async (displayedItemSelector: string, ITEM_CSS) => {
        document
          .querySelector(displayedItemSelector)
          .shadowRoot.querySelector("calcite-flow-item")
          .shadowRoot.querySelector<HTMLCalciteActionElement>(`.${ITEM_CSS.backButton}`)
          .click();
      },
      displayedItemSelector,
      ITEM_CSS
    );
    await page.waitForChanges();

    displayedItem = await page.find(displayedItemSelector);
    expect(await flow.getProperty("childElementCount")).toBe(1);
    expect(displayedItem.id).toBe("first");
  });
});
