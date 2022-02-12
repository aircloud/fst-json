import G from 'glob';
import { glob } from 'glob'

export async function getFiles(globFileLists: string[]): Promise<string[]> {
  async function getFilesByGlob(file: string, options?: G.IOptions): Promise<string[]> {
    return new Promise((rs, rj) => {
      glob(file, options, function (er, files) {
        if (er) rj(er);
        rs(files);
      });
    })
  }

  return new Promise((rs, rj) => {
    Promise.all(globFileLists.map(file => {
      return getFilesByGlob(file)
    })).then(fileLists => {
      let fileFlatList = fileLists.flat().filter((file) => {
        return /\.ts$/.test(`${file}`);
      });
      let fileFlatListDistinct = [...new Set(fileFlatList)];
      rs(fileFlatListDistinct);
    })
  })
}

// async function test() {
//   let files = await getFiles(["./*.ts"]);
//   console.log('files', files);
// }
// test();