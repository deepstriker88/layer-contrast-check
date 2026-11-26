import assert from 'node:assert/strict';
import {test} from 'node:test';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const cli=fileURLToPath(new URL('../bin/cli.js',import.meta.url));
function run(input,args=[]){return spawnSync(process.execPath,[cli,...args],{input,encoding:'utf8',timeout:10000,maxBuffer:1024*1024});}
test('CLI supports help without reading input',()=>{const r=run('', ['--help']);assert.equal(r.status,0);assert.match(r.stdout,/Usage:/);});
test('CLI exit codes and exact result',()=>{
 const pass=run(JSON.stringify({canvas:'#fff',pairs:[{name:'body',text:'#000',surface:'#fff'}]}));
 assert.equal(pass.status,0);assert.deepEqual(JSON.parse(pass.stdout),{results:[{name:'body',ratio:21,minimum:4.5,pass:true}]});
 const fail=run(JSON.stringify({canvas:'#fff',pairs:[{name:'muted',text:'#0008',surface:'#0004'}]}));
 assert.equal(fail.status,1);assert.equal(JSON.parse(fail.stdout).results[0].pass,false);
});
test('invalid UTF-8, JSON and oversized input fail without a report',()=>{
 for(const [input,pattern] of [['{',/valid UTF-8 JSON/],[Buffer.from([255]),/valid UTF-8 JSON/],['{}',/pairs must contain/],[' '.repeat(524289),/exceeds 512 KiB/]]){
  const r=run(input);assert.equal(r.status,2,r.error?.message);assert.equal(r.stdout,'');assert.match(r.stderr,pattern);
 }
});
