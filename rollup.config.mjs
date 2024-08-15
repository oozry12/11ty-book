import commonjs from "@rollup/plugin-commonjs";
import css from 'rollup-plugin-import-css';
import nodeResolve from "@rollup/plugin-node-resolve";
import postcss from "rollup-plugin-postcss";
import babel from "@rollup/plugin-babel";
import atImport from "postcss-import";
import postcssPresetEnv from "postcss-preset-env";
import copy from "rollup-plugin-copy";
import terser from "@rollup/plugin-terser";
import replace from "@rollup/plugin-replace";
import { visualizer } from 'rollup-plugin-visualizer';  


const sourceMap = process.env.NODE_ENV.trim() === "dev";

export default {
    input: "src/assets/js/main.js",
    output: { dir: "dist/assets/", sourcemap: sourceMap, format: "es" },
    plugins: [
        replace({
            "process.env.NODE_ENV": JSON.stringify("production"),
            preventAssignment: true,
        }),
        nodeResolve(),
        commonjs(),
        babel({ babelHelpers: "bundled" }),
        postcss({
            extract: true,
            sourceMap: sourceMap,
            extensions: ["css", "scss"],
            plugins: [
                atImport(),
                postcssPresetEnv(),
            ],
            minimize: true,
        }),
        css(),
        copy({
            targets: [
                { src: "src/assets/fonts", dest: "dist/assets/" },
                { src: "src/assets/img", dest: "dist/assets/" },
                { src: "src/assets/svg", dest: "dist/assets/" },
                { src: "src/assets/js/*.json", dest: "dist/assets/" },
            ],
        }),
        terser(),
        visualizer({  
            filename: 'dist/statistics.html'  
          })  
        // del({ targets: 'dist/*' })
    ],
};
