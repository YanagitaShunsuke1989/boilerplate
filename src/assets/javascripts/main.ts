// import { Item } from './item';

const elem = document.getElementById('output');

const num: number = 111;
const str: string = 'abc';
const isLock: boolean = true;
const sample: any = '111';




// 関数---------------------------------
// 返り値なし
function func(name: string): void {
}

// 返り値あり
function func2(name: string): number {
  return 0;
}


// クラス---------------------------------
class Person {
  constructor(private name: string, age: number) {

  }
  public run(speed: number): void {

  }
}


// 型エイリアス
type kata = { name: string, age: number };
const p: kata = {
  name: 'tanaka',
  age: 25
}






console.log(elem);
// var aBook = new Item('はじめてのTypeScript',1980);
// aBook.say(elem);