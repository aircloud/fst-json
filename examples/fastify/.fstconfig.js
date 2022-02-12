
module.exports = {
  sourceFiles: [
    './src/schema/*.ts'
  ],
  distFile: "./src/schema-dist.js",
  suffix: "js",
  target: "commonjs",
  format: 'fastify'
}