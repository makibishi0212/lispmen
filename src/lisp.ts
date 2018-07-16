import { hasOwnProperty } from 'mobx/lib/utils/utils';

type LispAtom = number | string | Array<any> | Function

interface LispElement {
    type:string;
    value:LispAtom;
}

export class Lisp {
    // 初期の定義済オブジェクト
    private defined = {
        'print': (x) => {
            console.log(x);
            return x;
        },
        'first': (x) => {
            return x[0];
        },
        '+': (...args) => {
            let sum = 0;
            args.forEach((num) => {
                sum += num;
            });
            
            return sum;
        },
        '-': (...args) => {
            return args[0] - args[1];
        },
        '*': (...args) => {
            let product = 1;
            args.forEach((num) => {
                product *= num;
            })

            return product;
        },
        '/': (...args) => {
            return args[0] / args[1];
        },
    };

    // 実行時に生じたカスタムオブジェクト
    private custom = {};

    // 式に対して特殊な動作をする関数オブジェクト
    private special = {
        // 関数を定義する関数
        'lambda': (source: LispElement | Array<any>, lispSpace?: LispSpace) => {
            return (...args) => {
                const lambdaScope = source[1].reduce((acc, x, i) => {
                    acc[x.value] = args[i];
                    return acc;
                }, {});

                return this.interpret(source[2], new LispSpace(lambdaScope, lispSpace));
            }
        }
    }

    constructor() {

    }

    // LISPソースを実行する
    public execute(lispSource: string) {
        const source = this.parse(lispSource);

        console.log(source);
        if(source) {
            return this.interpret(source);
        }else {
            return 'oh parse Error';
        }
    }

    // LISP文字列をjsArrayに変換する
    /*
    public parse(lispSource: string):Array<any> {
        // TODO: 改行の除去
        const parseTarget = 
        lispSource.replace(/\(/g, ' ( ')
        .replace(/\)/g, ' ) ')
        .trim()
        .split(/\s+/);

        // 正規表現で配列化したリストをネスト構造化にする
        const nestize = (parseTarget: Array<string>, list:Array<any> = undefined) => {
            if(typeof list === 'undefined') {
                return nestize(parseTarget, []);
            }else {
                const token = parseTarget.shift();
                if(typeof token === 'undefined') {
                    return list.pop();
                }else if(token === "(") {
                    list.push(nestize(parseTarget, []));
                    return nestize(parseTarget, list);
                }else if(token === ")") {
                    return list;
                }else {
                    let data:LispElement;
                    if(!isNaN(parseFloat(token))) {
                        // number
                        data = { type:'literal', value: parseFloat(token) };
                    }else if(token[0] === '"' && token.slice(-1) === '"') {
                        // 文字列
                        data = { type:'literal', value: token.slice(1, -1) };
                    }else {
                        // 関数またはシンボル
                        data = { type:'identifier', value: token };
                    }

                    return nestize(parseTarget, list.concat(data));
                }
            }
        }

        return nestize(parseTarget);
    }
    */

    // LISP文字列をjsArrayに変換する
    public parse(lispSourse:string):Array<LispElement> {
        const sourceString = lispSourse.slice(lispSourse.indexOf('(') + 1, lispSourse.lastIndexOf(')')).replace(/\r?\n/g, '');

        const parseArray = [];

        let tmpString:string = '';
        let step:number = 0;
        for(let i=0;i<sourceString.length;i++) {
            switch (sourceString[i]) {
                case '(':
                    step++;
                    tmpString += sourceString[i];
                    break;
                case ')':
                    step--;
                    tmpString += sourceString[i];
                    break;
                case ' ':
                    if(step === 0) {
                        if(tmpString[0] === '(') {
                            parseArray.push(this.parse(tmpString));
                        }else {
                            parseArray.push(this.parseAtom(tmpString));
                        }
                        tmpString = '';
                    }else {
                        tmpString += sourceString[i];
                    }
                    break;
                default:
                    tmpString += sourceString[i];
                    break;
            }
        }

        if(step) {
            return null;
        }

        if(tmpString[0] === '(') {
            parseArray.push(this.parse(tmpString));
        }else {
            parseArray.push(this.parseAtom(tmpString));
        }

        return parseArray;
    }

    private parseAtom(atomString: string) :LispElement {
        if(!isNaN(parseFloat(atomString))) {
            // number
            return { type:'literal', value: parseFloat(atomString) };
        }else if(atomString[0] === '"' && atomString.slice(-1) === '"') {
            // 文字列
            return { type:'literal', value: atomString.slice(1, -1) };
        }else {
            // 関数またはシンボル
            return { type:'identifier', value: atomString };
        }
    }

    // parse済のLISPソースを逐次実行する
    private interpret(source: LispElement | Array<any>, lispSpace?: LispSpace): LispAtom {
        if(typeof lispSpace === 'undefined') {
            return this.interpret(source, new LispSpace(this.defined));
        }else if(source instanceof Array) {
            // 配列の場合逐次実行した結果を返す
            return this.inrerpretList(source);
        }else if(source.hasOwnProperty('type') && source.hasOwnProperty('value')) {
            if(source.type === 'identifier') {
                // identifierのときは常にvalueはstring
                return lispSpace.get(source.value as string);
            }else if (source.type = 'literal') {
                // リテラルの場合単にその値を返す
                return source.value
            }
        }
    }

    // 配列になっているLISPソースを解決する
    private inrerpretList(source: Array<any>, lispSpace?: LispSpace) {
        if(Array.isArray(source) && source[0].value in this.special) {
            // 入力が配列で、最初の引数が特殊動作関数の場合
            return this.special[source[0].value](source, lispSpace)
        }else {
            const list = source.map((element) => {
                // 各要素を解釈して逐次実行する(再帰的に全ての要素を解決するので、このループを抜けた時には全てがLispAtom型になる)
                return this.interpret(element);
            });

            if(list[0] instanceof Function) {
                // １つ目の引数に入っている関数をひとつめ以降の要素を引数として実行した結果を返す
                // interpretが完了するとidentifierとして定義されていたLisp関数がjsの関数の形で返るため、実行することができる
                // (なぜlist[0](...list.slice(1))ではダメ？)
                return (list[0] as Function).apply(undefined, list.slice(1));
            }else {
                return list;
            }
        }
    }
}

class LispSpace {
    private scope: Object = undefined;
    private parent: LispSpace = null;

    constructor(scope: Object, parent: LispSpace = null) {
        this.scope = scope;
        this.parent = parent;
    }

    public get(identifier: string) {
        if(identifier in this.scope) {
            return this.scope[identifier];
        }else if(this.parent !== null) {
            return this.parent.get(identifier);
        }else {
            return null;
        }
    }
}
