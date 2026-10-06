// Run the isolated regression suite instead of modifying real accounts.
const {spawnSync}=require('node:child_process');
const result=spawnSync(process.execPath,['--test'],{cwd:__dirname,stdio:'inherit'});
process.exitCode=result.status || 0;
