import { storiesOf } from "@storybook/html";
import { withKnobs, select, boolean } from "@storybook/addon-knobs";
import { darkBackground, parseReadme } from "../../../.storybook/helpers";
import readme1 from "./readme.md";
import readme2 from "../calcite-radio-button/readme.md";

const notes1 = parseReadme(readme1);
const notes2 = parseReadme(readme2);
const notes = notes1.concat(`\n${notes2}`);

storiesOf("Radio Button Group", module)
  .addDecorator(withKnobs)
  .add(
    "Default",
    () => `
    <calcite-radio-button-group
      name="simple"
      disabled="${boolean("disabled", false)}"
      hidden="${boolean("hidden", false)}"
      layout="${select("layout", ["horizontal", "vertical"], "horizontal")}"
      scale="${select("scale", ["s", "m", "l"], "m")}"
    >
      <calcite-radio-button value="react" checked>React</calcite-radio-button>
      <calcite-radio-button value="ember">Ember</calcite-radio-button>
      <calcite-radio-button value="angular">Angular</calcite-radio-button>
      <calcite-radio-button value="vue">Vue</calcite-radio-button>
    </calcite-radio-button-group>
  `,
    { notes }
  )
  .add(
    "Wrapping Calcite Label",
    () => `
    <calcite-label>
      <span style="margin-bottom: 15px;">My great radio button group</span>
      <calcite-radio-button-group
        name="vertical"
        disabled="${boolean("disabled", false)}"
        hidden="${boolean("hidden", false)}"
        layout="${select("layout", ["horizontal", "vertical"], "horizontal")}"
        scale="${select("scale", ["s", "m", "l"], "m")}"
      >
        <calcite-radio-button value="react" checked>React</calcite-radio-button>
        <calcite-radio-button value="ember">Ember</calcite-radio-button>
        <calcite-radio-button value="angular">Angular</calcite-radio-button>
        <calcite-radio-button value="vue">Vue</calcite-radio-button>
      </calcite-radio-button-group>
    </calcite-label>
  `,
    { notes }
  )
  .add(
    "Dark mode",
    () => `
    <calcite-radio-button-group
      theme="dark"
      name="dark"
      disabled="${boolean("disabled", false)}"
      hidden="${boolean("hidden", false)}"
      layout="${select("layout", ["horizontal", "vertical"], "horizontal")}"
      scale="${select("scale", ["s", "m", "l"], "m")}"
    >
      <calcite-radio-button value="react" checked>React</calcite-radio-button>
      <calcite-radio-button value="ember">Ember</calcite-radio-button>
      <calcite-radio-button value="angular">Angular</calcite-radio-button>
      <calcite-radio-button value="vue">Vue</calcite-radio-button>
    </calcite-radio-button-group>
  `,
    { notes, backgrounds: darkBackground }
  );
