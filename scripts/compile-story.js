const fs=require('node:fs');const path=require('node:path');const {Compiler,CompilerOptions}=require('inkjs/full');
function compile(){const diagnostics=[];const story=new Compiler(fs.readFileSync(path.join(__dirname,'../story.ink'),'utf8'),new CompilerOptions(undefined,undefined,false,(message,type)=>diagnostics.push({message,type}))).Compile();if(diagnostics.some(d=>d.type===2))throw Error(diagnostics.map(d=>d.message).join('\n'));return story;}
if(require.main===module){const story=compile();fs.writeFileSync(path.join(__dirname,'../public/story.json'),story.ToJson());console.log('Compiled story.ink → public/story.json');}
module.exports={compile};
