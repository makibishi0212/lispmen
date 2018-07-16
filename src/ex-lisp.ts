type LispAtom = number | string | boolean
type LispElement = LispAtom | Array<any> | LispError | LispVar;

export class Lisp {
    private varList:{[varName: string]: LispElement | Function} = {};
    private customs:{[varName: string]:boolean} = {};

    constructor() {
        this.varList["t"] = true;
        this.varList["nil"] = false;
        this.varList["+"] = (...args: Array<LispVar>) => {
            let error:LispError = null;

            let sum = 0;
            const errorOccured = args.some((lispvar: LispVar) => {
                const isNotReal =  this.isNotReal(lispvar);
                if(isNotReal) {
                    error = isNotReal;
                    return true;
                }else {
                    if(typeof lispvar.value !== 'number') {
                        return true;
                    }
                }
                sum += lispvar.value;
            });

            if(errorOccured) {
                return error;
            }

            return sum;
        }

        this.varList["*"] = (...args: Array<LispVar>) => {
            let error:LispError = null;

            let product = 1;
            const errorOccured = args.some((lispvar: LispVar) => {
                const isNotReal =  this.isNotReal(lispvar);
                if(isNotReal) {
                    error = isNotReal;
                    return true;
                }else {
                    if(typeof lispvar.value !== 'number') {
                        error = new LispError('* args must number.');
                        return true;
                    }
                }
                product *= lispvar.value;
            });

            if(errorOccured) {
                return error;
            }

            return product;
        }

        this.varList["-"] = (arg1:LispVar, arg2:LispVar) => {
            let error:LispError = null;

            const isNotReal1 =  this.isNotReal(arg1);
            const isNotReal2 =  this.isNotReal(arg2);
            if(isNotReal1 || isNotReal2) {
                error = isNotReal1 ? isNotReal1 : isNotReal2;
            }

            if(arg1.value !== 'number' || arg2.value !== 'number') {
                error = new LispError('- args must number.');
            }

            if(error) {
                return error; 
            }

            return arg1.value - arg2.value;
        }

        this.varList["/"] = (arg1:LispVar, arg2:LispVar) => {
            let error:LispError = null;

            const isNotReal1 =  this.isNotReal(arg1);
            const isNotReal2 =  this.isNotReal(arg2);
            if(isNotReal1 || isNotReal2) {
                error = isNotReal1 ? isNotReal1 : isNotReal2;
            }

            if(arg1.value !== 'number' || arg2.value !== 'number') {
                error = new LispError('- args must number.');
            }

            if(error) {
                return error;
            }

            return arg1.value / arg2.value;
        }

        this.varList["setq"] = (symbolName: LispVar, value: LispVar) => {
            let error:LispError = null;

            const isNotReal = this.isNotReal(value);
            if(isNotReal) {
                error = isNotReal;
            }

            const isNotSpace = this.isNotSpace(symbolName);
            if(isNotSpace) {
                error = isNotSpace
            }

            if(error) {
                return error;
            }

            this.customs[symbolName.key] = true;
            this.varList[symbolName.key] = value.value;
        }

        this.varList["defvar"] = (symbolName: LispVar, value: LispVar) => {
            let error:LispError = null;

            if(typeof symbolName.value !== 'undefined') {
                // 変数の値が設定済の場合は何もしない
                return;
            }

            const isNotReal = this.isNotReal(value);
            if(isNotReal) {
                error = isNotReal;
            }

            const isNotSpace = this.isNotSpace(symbolName);
            if(isNotSpace) {
                error = isNotSpace
            }

            if(error) {
                return error;
            }

            this.customs[symbolName.key] = true;
            this.varList[symbolName.key] = value.value;
        }
    }

    public parse(lispSourse:string):Array<LispElement> {
        const sourceString = lispSourse.slice(lispSourse.indexOf('(') + 1, lispSourse.lastIndexOf(')'));

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

    private parseAtom(atomString: string) :string | number {
        if(!Number.isNaN(Number(atomString))) {
            return Number(atomString);
        }else {
            return atomString;
        }
    }

    public execute(source:LispElement) {
        let exesource:LispElement = JSON.parse(JSON.stringify(source));

        // カスタム変数を削除する
        for(const customvar in this.customs) {
            delete this.varList[customvar];
        }
        this.customs = {};

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
                if(element instanceof LispError) {
                    error = element;
                    return true
                }else if(element instanceof LispVar) {
                    // 引数オブジェクトのとき
                    newargs.push(element);
                }else {
                    // 未評価式を評価
                    const result = this.eval(element);
                    if(result instanceof LispError) {
                        error = result;
                        return true;
                    }else {
                        // 値を返さない関数の場合式解決後に引数として登録しない
                        if(typeof result !== 'undefined') {
                            newargs.push(result);
                        }
                    }
                }
            })

            if(errorOccured) {
                // 引数の評価時に発生したエラーを返す
                return error;
            }else {
                if(typeof this.varList[func] === 'function') {
                    // 関数の実行結果を返す
                    const evaled = (this.varList[func] as Function)(...newargs);
                    if(typeof evaled !== 'undefined') {
                        if(evaled instanceof LispError) {
                            return evaled;
                        }else {
                            return new LispVar(undefined, evaled);
                        }
                    }
                }
            }
        }else if(this.isSymbol(expression) && typeof(expression) === 'string') {
            // シンボルのとき
            return new LispVar(expression, this.varList[expression]);
        }else if(expression instanceof LispError) {
            // エラーのとき
            return expression;
        }else if(expression instanceof LispVar) {
            // 引数オブジェクトのとき
            return expression;
        }else if(Array.isArray(expression)) {
            // リストのとき

            // 配列の要素を評価中に発生したエラーを格納する変数
            let error:LispError = null;

            const evaledArray = [];
            const errorOccured = expression.some((listMem) => {
                if(this.isevaluable(listMem)) {
                    // 関数の場合
                    evaledArray.push(this.eval(listMem));
                }else if(this.isSymbol(listMem)) {
                    // シンボルの場合
                    console.log('oh symbol error', listMem);
                    if(this.varList[listMem]) {
                        evaledArray.push(this.varList[listMem]);
                    }else {
                        error = new LispError('symbol ' + listMem + ' is undefined');
                        return true;
                    }
                }else if(listMem instanceof LispError) {
                    error = listMem;
                    return true;
                }else {
                    // シンボルでも関数でもない場合
                    evaledArray.push(listMem)
                }

                return false;
            });

            if(errorOccured) {
                // 配列要素の評価時に発生したエラーを返す
                return error;
            }else {
                new LispVar(undefined, evaledArray);
            }
        }else {
            // リスト・数字・文字列・ブーリアン・nullのとき
            return new LispVar(undefined, expression);
        }
    }

    // 実体を持つLispVarかどうか判定し、実体がない場合エラーを返す
    private isNotReal(lispvar: LispVar): LispError {
        if(typeof lispvar.value === 'undefined') {
            if(typeof lispvar.key !== 'undefined') {
                return new LispError('symbol ' + lispvar.key + ' is undefined');
            }else {
                return new LispError('illigal argument');
            }
        }else {
            return undefined;
        }
    }

    // 実体未定義の入れ物状態になっているLispVarかどうか判定する
    private isNotSpace(lispvar: LispVar) {
        if(typeof lispvar.key === 'undefined') {
            return new LispError('undefined error');
        }else {
            return undefined;
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
        if(typeof(expression) === 'string' && expression[0] !== '"' && expression[expression.length] !== '"') {
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
    constructor(message: string) {
        this.message = 'ERROR:' + message;
    }
}


// TODO: カスタム定義の変数を実行時に初期化する実装を追加
// TODO: 改行対応
// TODO: defun実装
