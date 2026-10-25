const assert=require('node:assert/strict');
const {parseBackup,makeBackup,BACKUP_FORMAT}=require('../.domain-check/domain/backup/format.js');
let count=0;function check(name,fn){fn();count++;console.log('✔',name);}
const empty={settings:[],sessions:[],skills:[],plans:[],profiles:[]};
const sampleSession={id:'a-1',endedAt:'2026-10-25T00:00:00.000Z',mode:'custom',locale:'en',layoutId:'en-qwerty',promptId:'demo',schemaVersion:1,summary:{netWpm:60,rawWpm:72,cpm:360,accuracy:.97,durationMs:30000,correctedErrors:1,uncorrectedErrors:0,typedCharacters:180,correctAttempts:180,totalAttempts:186,deletions:2,errorTypes:{insertion:0,omission:0,substitution:0,transposition:0},consistency:95,medianIntervalMs:130,eligibleForSkillUpdate:true,scoringVersion:'tykora-1.0.0'}};
const sample={...empty,sessions:[sampleSession]};
check('Valid export is round-trippable',()=>assert.deepEqual(parseBackup(JSON.parse(JSON.stringify(makeBackup(sample)))).data,sample));
check('No data export is valid',()=>assert.deepEqual(makeBackup(empty).data,empty));
check('Unknown format blocked',()=>assert.throws(()=>parseBackup({...makeBackup(empty),format:'other'})));
check('Future schema version blocked',()=>assert.throws(()=>parseBackup({...makeBackup(empty),version:2})));
check('Missing collections blocked',()=>assert.throws(()=>parseBackup({...makeBackup(empty),data:{}})));
check('Invalid session score blocked',()=>assert.throws(()=>makeBackup({...empty,sessions:[{...sampleSession,summary:{...sampleSession.summary,accuracy:2}}]})));
check('Duplicate IDs blocked',()=>assert.throws(()=>makeBackup({...empty,sessions:[sampleSession,sampleSession]})));
check('External active content cannot be a collection',()=>assert.throws(()=>makeBackup({...empty,profiles:'<script>alert(1)</script>'})));
check('Missing metric fields rejected',()=>assert.throws(()=>makeBackup({...empty,sessions:[{...sampleSession,summary:{netWpm:60,rawWpm:70,accuracy:0.9,durationMs:30000}}]})));
check('No executable code in format',()=>assert.equal(BACKUP_FORMAT,'tykora-local-backup'));
const v2Summary={...sampleSession.summary,scoringVersion:'tykora-2.0.0',
 rawWpm:null,netWpm:null,cpm:null,activeDurationMs:1200,finalAccuracy:1,
 correctedErrorRate:0,uncorrectedErrorRate:0,p90IntervalMs:null,
 rhythmStability:null,pauseThresholdMs:2000,consistency:null};
check('V2 short-session null speeds roundtrip without fabricating zero',()=>{
 const result=makeBackup({...empty,sessions:[{...sampleSession,summary:v2Summary}]});
 assert.equal(parseBackup(JSON.parse(JSON.stringify(result))).data.sessions[0].summary.netWpm,null);
});
check('V1 cannot use nullable speeds',()=>assert.throws(()=>
 makeBackup({...empty,sessions:[{...sampleSession,summary:{...sampleSession.summary,rawWpm:null}}]})));
check('V2 rejects malformed active-duration fields',()=>assert.throws(()=>
 makeBackup({...empty,sessions:[{...sampleSession,summary:{...v2Summary,activeDurationMs:999999}}]})));
check('New backups carry a CRC32 corruption-detection checksum',()=>{
 const backup=makeBackup(sample);
 assert.equal(backup.checksumAlgorithm,'crc32');
 assert.match(backup.checksum,/^[a-f0-9]{8}$/);
 assert.deepEqual(parseBackup(JSON.parse(JSON.stringify(backup))).data,sample);
});
check('Tampering with stored history invalidates checksum before import',()=>{
 const backup=makeBackup(sample);
 const broken=JSON.parse(JSON.stringify(backup));
 broken.data.sessions[0].summary.accuracy=.5;
 assert.throws(()=>parseBackup(broken),/Контрольная сумма/);
});
check('Previously exported v1 files without checksum remain importable',()=>{
 const backup=makeBackup(sample);
 delete backup.checksum;
 delete backup.checksumAlgorithm;
 assert.deepEqual(parseBackup(backup).data,sample);
});
console.log(`${count} local backup format checks passed.`);
