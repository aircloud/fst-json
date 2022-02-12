module.exports = {
  "target": "es6",
  "suffix": "ts",
  "sourceFiles": [
      "./schema/not-support/object.ts",
  ],
  "distFile": './output/schema-dist-demo.ts',
  "classOptions": {
    ignore: false,
  },
  "format": 'fastify'
}