import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import postcss from "rollup-plugin-postcss";
import babel from "@rollup/plugin-babel";
import atImport from "postcss-import";
import postcssPresetEnv from "postcss-preset-env";
import copy from "rollup-plugin-copy";
import terser from "@rollup/plugin-terser";
import del from 'rollup-plugin-delete'

const sourceMap = process.env.NODE_ENV.trim() === 'dev';

export default {
    input: "src/assets/js/main.js",
    output: { dir: "dist/assets/", sourcemap: sourceMap, format: "es" },
    plugins: [
        nodeResolve(),
        commonjs(),
        babel({ babelHelpers: "bundled" }),
        postcss({
            extract: true,
            sourceMap: sourceMap,
            extensions: ["css", "scss"],
            plugins: [
                atImport(),
                postcssPresetEnv({
                    features: {
                        "custom-properties": false,
                        "logical-properties-and-values": false,
                    },
                }),
            ],
            minimize: true,
        }),
        copy({
            targets: [
                { src: "src/assets/fonts", dest: "dist/assets/" },
                { src: "src/assets/img", dest: "dist/assets/" },
                { src: "src/assets/svg", dest: "dist/assets/" },
            ],
        }),
        terser(),
        // del({ targets: 'dist/*' })
    ],
};
