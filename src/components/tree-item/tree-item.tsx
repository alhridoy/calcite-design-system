import {
  Component,
  Element,
  Prop,
  Host,
  Event,
  EventEmitter,
  Listen,
  Watch,
  h,
  VNode
} from "@stencil/core";
import { TreeItemSelectDetail } from "./interfaces";
import { TreeSelectionMode } from "../tree/interfaces";
import { nodeListToArray, getElementDir, filterDirectChildren, getSlotted } from "../../utils/dom";

import { Scale } from "../interfaces";
import { CSS, SLOTS, ICONS } from "./resources";
import { CSS_UTILITY } from "../../utils/resources";
import {
  ConditionalSlotComponent,
  connectConditionalSlotComponent,
  disconnectConditionalSlotComponent
} from "../../utils/conditionalSlot";

/**
 * @slot - A slot for adding content to the item.
 * @slot children - A slot for adding nested `calcite-tree` elements.
 */
@Component({
  tag: "calcite-tree-item",
  styleUrl: "tree-item.scss",
  shadow: true
})
export class TreeItem implements ConditionalSlotComponent {
  //--------------------------------------------------------------------------
  //
  //  Element
  //
  //--------------------------------------------------------------------------

  @Element() el: HTMLCalciteTreeItemElement;

  //--------------------------------------------------------------------------
  //
  //  Properties
  //
  //--------------------------------------------------------------------------

  /** Is the item currently selected */
  @Prop({ mutable: true, reflect: true }) selected = false;

  /** True if the item is in an expanded state */
  @Prop({ mutable: true, reflect: true }) expanded = false;

  @Watch("expanded")
  expandedHandler(newValue: boolean): void {
    this.updateParentIsExpanded(this.el, newValue);
  }

  /** @internal Is the parent of this item expanded? */
  @Prop() parentExpanded = false;

  /** @internal What level of depth is this item at? */
  @Prop({ reflect: true, mutable: true }) depth = -1;

  /** @internal Does this tree item have a tree inside it? */
  @Prop({ reflect: true, mutable: true }) hasChildren: boolean = null;

  /** @internal Draw lines (set on parent) */
  @Prop({ reflect: true, mutable: true }) lines: boolean;

  /** Display checkboxes (set on parent)
   * @internal
   * @deprecated set "ancestors" selection-mode on parent tree for checkboxes
   */
  @Prop() inputEnabled: boolean;

  /** @internal Scale of the parent tree, defaults to m */
  @Prop({ reflect: true, mutable: true }) scale: Scale;

  /**
   * @internal
   * In ancestor selection mode,
   * show as indeterminate when only some children are selected
   **/
  @Prop({ reflect: true }) indeterminate: boolean;

  /** @internal Tree selection-mode (set on parent) */
  @Prop({ mutable: true }) selectionMode: TreeSelectionMode;

  @Watch("selectionMode")
  getselectionMode(): void {
    this.isSelectionMultiLike =
      this.selectionMode === TreeSelectionMode.Multi ||
      this.selectionMode === TreeSelectionMode.MultiChildren;
  }

  //--------------------------------------------------------------------------
  //
  //  Lifecycle
  //
  //--------------------------------------------------------------------------

  connectedCallback(): void {
    this.parentTreeItem = this.el.parentElement.closest("calcite-tree-item");
    if (this.parentTreeItem) {
      const { expanded } = this.parentTreeItem;
      this.updateParentIsExpanded(this.parentTreeItem, expanded);
    }
    connectConditionalSlotComponent(this);
  }

  disconnectedCallback(): void {
    disconnectConditionalSlotComponent(this);
  }

  componentWillRender(): void {
    this.hasChildren = !!this.el.querySelector("calcite-tree");
    this.depth = 0;

    let parentTree = this.el.closest("calcite-tree");

    if (!parentTree) {
      return;
    }

    this.selectionMode = parentTree.selectionMode;
    this.scale = parentTree.scale || "m";
    this.lines = parentTree.lines;

    let nextParentTree;
    while (parentTree) {
      nextParentTree = parentTree.parentElement.closest("calcite-tree");
      if (nextParentTree === parentTree) {
        break;
      } else {
        parentTree = nextParentTree;
        this.depth = this.depth + 1;
      }
    }
  }

  componentDidLoad(): void {
    this.updateAncestorTree();
  }

  //--------------------------------------------------------------------------
  //
  //  Private State/Props
  //
  //--------------------------------------------------------------------------

  private isSelectionMultiLike: boolean;

  render(): VNode {
    const rtl = getElementDir(this.el) === "rtl";
    const showBulletPoint =
      this.selectionMode === TreeSelectionMode.Single ||
      this.selectionMode === TreeSelectionMode.Children;
    const showCheckmark =
      this.selectionMode === TreeSelectionMode.Multi ||
      this.selectionMode === TreeSelectionMode.MultiChildren;
    const chevron = this.hasChildren ? (
      <calcite-icon
        class={{
          [CSS.chevron]: true,
          [CSS_UTILITY.rtl]: rtl
        }}
        data-test-id="icon"
        icon={ICONS.chevronRight}
        onClick={this.iconClickHandler}
        scale="s"
      />
    ) : null;
    const defaultSlotNode: VNode = <slot key="default-slot" />;
    const checkbox =
      this.selectionMode === TreeSelectionMode.Ancestors ? (
        <label class={CSS.checkboxLabel} key="checkbox-label">
          <calcite-checkbox
            checked={this.selected}
            class={CSS.checkbox}
            data-test-id="checkbox"
            indeterminate={this.hasChildren && this.indeterminate}
            scale={this.scale}
            tabIndex={-1}
          />
          {defaultSlotNode}
        </label>
      ) : null;
    const selectedIcon = showBulletPoint
      ? ICONS.bulletPoint
      : showCheckmark
      ? ICONS.checkmark
      : null;
    const bulletOrCheckIcon = selectedIcon ? (
      <calcite-icon
        class={{
          [CSS.bulletPointIcon]: selectedIcon === ICONS.bulletPoint,
          [CSS.checkmarkIcon]: selectedIcon === ICONS.checkmark,
          [CSS_UTILITY.rtl]: rtl
        }}
        icon={selectedIcon}
        scale="s"
      />
    ) : null;

    const hidden = !(this.parentExpanded || this.depth === 1);

    return (
      <Host
        aria-expanded={this.hasChildren ? this.expanded.toString() : undefined}
        aria-hidden={hidden.toString()}
        aria-selected={this.selected ? "true" : showCheckmark ? "false" : undefined}
        calcite-hydrated-hidden={hidden}
        role="treeitem"
        tabindex={this.parentExpanded || this.depth === 1 ? "0" : "-1"}
      >
        <div
          class={{
            [CSS.nodeContainer]: true,
            [CSS_UTILITY.rtl]: rtl
          }}
          data-selection-mode={this.selectionMode}
          ref={(el) => (this.defaultSlotWrapper = el as HTMLElement)}
        >
          {chevron}
          {bulletOrCheckIcon}
          {checkbox ? checkbox : defaultSlotNode}
        </div>
        <div
          class={{
            [CSS.childrenContainer]: true,
            [CSS_UTILITY.rtl]: rtl
          }}
          data-test-id="calcite-tree-children"
          onClick={this.childrenClickHandler}
          ref={(el) => (this.childrenSlotWrapper = el as HTMLElement)}
          role={this.hasChildren ? "group" : undefined}
        >
          <slot name={SLOTS.children} />
        </div>
      </Host>
    );
  }

  //--------------------------------------------------------------------------
  //
  //  Event Listeners
  //
  //--------------------------------------------------------------------------

  @Listen("click")
  onClick(e: Event): void {
    // Solve for if the item is clicked somewhere outside the slotted anchor.
    // Anchor is triggered anywhere you click
    const [link] = filterDirectChildren<HTMLAnchorElement>(this.el, "a");
    if (link && (e.composedPath()[0] as any).tagName.toLowerCase() !== "a") {
      const target = link.target === "" ? "_self" : link.target;
      window.open(link.href, target);
    }
    this.calciteTreeItemSelect.emit({
      modifyCurrentSelection:
        this.selectionMode === TreeSelectionMode.Ancestors || this.isSelectionMultiLike,
      forceToggle: false
    });
  }

  iconClickHandler = (event: MouseEvent): void => {
    event.stopPropagation();
    this.expanded = !this.expanded;
    if (this.selectionMode !== TreeSelectionMode.Ancestors) {
      this.calciteTreeItemSelect.emit({
        modifyCurrentSelection: this.isSelectionMultiLike,
        forceToggle: true
      });
    }
  };

  childrenClickHandler = (event: MouseEvent): void => event.stopPropagation();

  @Listen("keydown") keyDownHandler(e: KeyboardEvent): void {
    let root;

    switch (e.key) {
      case " ":
        this.calciteTreeItemSelect.emit({
          modifyCurrentSelection: this.isSelectionMultiLike,
          forceToggle: false
        });

        e.preventDefault();
        e.stopPropagation();
        break;
      case "Enter":
        // activates a node, i.e., performs its default action. For parent nodes, one possible default action is to open or close the node. In single-select trees where selection does not follow focus (see note below), the default action is typically to select the focused node.
        const link = nodeListToArray(this.el.children).find((e) =>
          e.matches("a")
        ) as HTMLAnchorElement;

        if (link) {
          link.click();
          this.selected = true;
        } else {
          this.calciteTreeItemSelect.emit({
            modifyCurrentSelection: this.isSelectionMultiLike,
            forceToggle: false
          });
        }

        e.preventDefault();
        e.stopPropagation();
        break;
      case "ArrowLeft":
        // When focus is on an open node, closes the node.
        if (this.hasChildren && this.expanded) {
          this.expanded = false;

          e.preventDefault();
          e.stopPropagation();
          break;
        }

        // When focus is on a child node that is also either an end node or a closed node, moves focus to its parent node.
        const parentItem = this.parentTreeItem;

        if (parentItem && (!this.hasChildren || this.expanded === false)) {
          parentItem.focus();

          e.preventDefault();
          e.stopPropagation();
          break;
        }

        // When focus is on a root node that is also either an end node or a closed node, does nothing.
        break;
      case "ArrowRight":
        // When focus is on a closed node, opens the node; focus does not move.
        if (this.hasChildren && this.expanded === false) {
          this.expanded = true;
          e.preventDefault();
          e.stopPropagation();
          break;
        }

        // When focus is on a open node, moves focus to the first child node.
        if (this.hasChildren && this.expanded) {
          this.el.querySelector("calcite-tree-item").focus();
          break;
        }

        // When focus is on an end node, does nothing.
        break;
      case "ArrowUp":
        const previous = this.el.previousElementSibling as HTMLCalciteTreeItemElement;
        if (previous && previous.matches("calcite-tree-item")) {
          previous.focus();
        }
        break;
      case "ArrowDown":
        const next = this.el.nextElementSibling as HTMLCalciteTreeItemElement;
        if (next && next.matches("calcite-tree-item")) {
          next.focus();
        }
        break;
      case "Home":
        root = this.el.closest("calcite-tree:not([child])") as HTMLCalciteTreeElement;

        const firstNode = root.querySelector("calcite-tree-item");

        firstNode.focus();

        break;
      case "End":
        root = this.el.closest("calcite-tree:not([child])");

        let currentNode = root.children[root.children.length - 1]; // last child
        let currentTree = nodeListToArray(currentNode.children).find((e) =>
          e.matches("calcite-tree")
        );
        while (currentTree) {
          currentNode = currentTree.children[root.children.length - 1];
          currentTree = nodeListToArray(currentNode.children).find((e) =>
            e.matches("calcite-tree")
          );
        }
        currentNode.focus();
        break;
    }
  }

  //--------------------------------------------------------------------------
  //
  //  Events
  //
  //--------------------------------------------------------------------------

  /**
   * @internal
   */
  @Event() calciteTreeItemSelect: EventEmitter<TreeItemSelectDetail>;

  //--------------------------------------------------------------------------
  //
  //  Public Methods
  //
  //--------------------------------------------------------------------------

  //--------------------------------------------------------------------------
  //
  //  Private State/Props
  //
  //--------------------------------------------------------------------------

  childrenSlotWrapper!: HTMLElement;

  defaultSlotWrapper!: HTMLElement;

  private parentTreeItem?: HTMLCalciteTreeItemElement;

  //--------------------------------------------------------------------------
  //
  //  Private Methods
  //
  //--------------------------------------------------------------------------

  private updateParentIsExpanded = (el: HTMLCalciteTreeItemElement, expanded: boolean): void => {
    const items = getSlotted<HTMLCalciteTreeItemElement>(el, SLOTS.children, {
      all: true,
      selector: "calcite-tree-item"
    });
    items.forEach((item) => (item.parentExpanded = expanded));
  };

  private updateAncestorTree = (): void => {
    if (this.selected && this.selectionMode === TreeSelectionMode.Ancestors) {
      const ancestors: HTMLCalciteTreeItemElement[] = [];
      let parent = this.parentTreeItem;
      while (parent) {
        ancestors.push(parent);
        parent = parent.parentElement.closest("calcite-tree-item");
      }
      ancestors.forEach((item) => (item.indeterminate = true));
      return;
    }
  };
}