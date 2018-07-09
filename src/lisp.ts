type LispAtom = number | string | boolean
type LispElement = LispAtom | Array<any> | LispError | LispVar;

export class Lisp {
    private varList:{[varName: string]: LispElement | Function} = {};

    constructor() {
        this.varList["+"] = (...args: Array<LispVar>) => {
            let sum = 0;
            args.forEach((lispvar: LispVar) => {
                sum += lispvar.value;
            })
            return sum;
        }

        this.varList["*"] = (...args: Array<LispVar>) => {
            let product = 1;
            args.forEach((lispvar: LispVar) => {
                product *= lispvar.value;
            })
            return product;
        }

        this.varList["-"] = (arg1:LispVar, arg2:LispVar) => {
            return arg1.value - arg2.value;
        }

        this.varList["/"] = (arg1:LispVar, arg2:LispVar) => {
            return arg1.value / arg2.value;
        }

        this.varList["setq"] = (arg1: LispVar, arg2: LispVar) => {
            this.varList[arg1.key] = arg2.value;
        }
    }

    public parse(lispSourse:string):Array<LispElement> {
        const sourceString = lispSourse.slice(lispSourse.indexOf('(') + 1, lispSourse.lastIndexOf(')'));

        const parseArray = [];

        //(+ (setq a 100) (+ 1 2) 2 a 3)

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

    private parseAtom(atomString: string) :string | number {
        if(!Number.isNaN(Number(atomString))) {
            return Number(atomString);
        }else {
            return atomString;
        }
    }

    public execute(source:LispElement) {
        let exesource:LispElement = JSON.parse(JSON.stringify(source));

        if(!source) {
            return 'Oh Parse Error';
        }

        const result = this.eval(exesource);
        if(result instanceof LispError) {
            return result.message;
        }else if(result instanceof LispVar) {
            return result.value;
        }
    }

    private eval(expression:LispElement):LispVar | LispError {

        if(this.isevaluable(expression)) {
            // 評価可能な式のとき

            const exesource:Array<LispElement> = JSON.parse(JSON.stringify(expression));
            const func = exesource.shift() as string;
            const args:Array<LispElement> = exesource;

            // 評価済の状態にした関数にわたす引数
            const newargs: Array<LispElement> = [];

            // newargsを作成中に発生したエラーを格納する変数
            let error = null;

            const errorOccured = args.some((element) => {
                if(Array.isArray(element) && this.isevaluable(element)){
                    // 関数を評価
                    const result = this.eval(element);
                    if(result instanceof LispError) {
                        error = result;
                        return true;
                    }else {
                        // 値を返さない関数の場合式解決後に引数として登録しない
                        if(typeof result.value !== 'undefined') {
                            newargs.push(result);
                        }
                    }
                }else if(element instanceof LispError) {
                    error = element;
                    return true
                }else if(element instanceof LispVar) {
                    // 引数オブジェクトのとき
                    newargs.push(element);
                }else {
                    newargs.push(this.eval(element));
                }
            })

            if(errorOccured) {
                // 引数の評価時に発生したエラーを返す
                return error;
            }

            if(typeof this.varList[func] === 'function') {
                // 関数の実行結果を返す
                console.log(newargs);
                const evaled = new LispVar(undefined, (this.varList[func] as Function)(...newargs));
                if(typeof evaled !== 'undefined') {
                    return evaled;
                }
            }
        }else if(this.isSymbol(expression) && typeof(expression) === 'string') {
            // シンボルのとき

            /*
            if(this.varList[expression]) {
                if(!(this.varList[expression] instanceof Function)) {
                    return this.varList[expression] as LispElement;
                }else {
                    // TODO: 関数が格納されたシンボルをどのように扱うか検討する
                }
            }else {
                return new LispError('symbol ' + expression + ' is undefined.', expression);
            }
            */

            return new LispVar(expression, this.varList[expression]);
        }else if(expression instanceof LispError) {
            // エラーのとき
            return expression;
        }else if(expression instanceof LispVar) {
            // 引数オブジェクトのとき
            return expression;
        }else {
            // リスト・数字・文字列・ブーリアン・nullのとき
            return new LispVar(undefined, expression);
        }
    }

    // 式が評価可能かどうか判定する
    private isevaluable(expression:LispElement):boolean {
        // 配列で、最初の要素がシンボルとして与えられた文字列で、そのシンボルが定義されておりかつ関数の場合
        if(Array.isArray(expression) && typeof expression[0] === 'string') {
            const symbolName = expression[0] as string;
            if(this.isSymbol(symbolName) && typeof(this.varList[symbolName]) === 'function') {
                return true;
            }
        }

        return false;
    }

    // 文字列がシンボルかどうか判定する
    private isSymbol(expression:LispElement):boolean {
        if(typeof(expression) === 'string' && expression.substr(0,2) !== '#\\') {
            return true;
        }else {
            return false;
        }
    }
}

class LispVar {
    public key = '';
    public value = undefined;
    constructor(key: string, value: any) {
        this.key = key;
        this.value = value;
    }
}

class LispError {
    public message = '';
    public errorSymbol = null;
    constructor(message: string, errorSymbol: string) {
        this.message = 'ERROR:' + message;
        this.errorSymbol = errorSymbol;
    }
}

//TODO: setqのエラーを利用した方法を廃止する。
//TODO: 関数への変数情報渡しをLispVarを使って行うようにする。
//TODO: LispVarから変数そのものの情報か実体かを取り出すユーティリティを作成し、各関数内で使うようにする。
