(function(){var e=(e,t,n)=>{if(!t.has(e))throw TypeError(`Cannot `+n)},t=(t,n,r)=>(e(t,n,`read from private field`),r?r.call(t):n.get(t)),n=(e,t,n)=>{if(t.has(e))throw TypeError(`Cannot add the same private member more than once`);t instanceof WeakSet?t.add(e):t.set(e,n)},r=(t,n,r,i)=>(e(t,n,`write to private field`),i?i.call(t,r):n.set(t,r),r),i=(e,n,i,a)=>({set _(t){r(e,n,t,i)},get _(){return t(e,n,a)}}),a=(t,n,r)=>(e(t,n,`access private method`),r),o=new Uint8Array(8),s=new DataView(o.buffer),c=e=>[(e%256+256)%256],l=e=>(s.setUint16(0,e,!1),[o[0],o[1]]),u=e=>(s.setInt16(0,e,!1),[o[0],o[1]]),d=e=>(s.setUint32(0,e,!1),[o[1],o[2],o[3]]),f=e=>(s.setUint32(0,e,!1),[o[0],o[1],o[2],o[3]]),p=e=>(s.setInt32(0,e,!1),[o[0],o[1],o[2],o[3]]),m=e=>(s.setUint32(0,Math.floor(e/2**32),!1),s.setUint32(4,e,!1),[o[0],o[1],o[2],o[3],o[4],o[5],o[6],o[7]]),h=e=>(s.setInt16(0,256*e,!1),[o[0],o[1]]),g=e=>(s.setInt32(0,2**16*e,!1),[o[0],o[1],o[2],o[3]]),_=e=>(s.setInt32(0,2**30*e,!1),[o[0],o[1],o[2],o[3]]),v=(e,t=!1)=>{let n=Array(e.length).fill(null).map((t,n)=>e.charCodeAt(n));return t&&n.push(0),n},y=e=>e&&e[e.length-1],ee=e=>{let t;for(let n of e)(!t||n.presentationTimestamp>t.presentationTimestamp)&&(t=n);return t},b=(e,t,n=!0)=>{let r=e*t;return n?Math.round(r):r},te=e=>{let t=Math.PI/180*e,n=Math.cos(t),r=Math.sin(t);return[n,r,0,-r,n,0,0,0,1]},ne=te(0),re=e=>[g(e[0]),g(e[1]),_(e[2]),g(e[3]),g(e[4]),_(e[5]),g(e[6]),g(e[7]),_(e[8])],x=e=>!e||typeof e!=`object`?e:Array.isArray(e)?e.map(x):Object.fromEntries(Object.entries(e).map(([e,t])=>[e,x(t)])),S=e=>e>=0&&e<2**32,C=(e,t,n)=>({type:e,contents:t&&new Uint8Array(t.flat(10)),children:n}),w=(e,t,n,r,i)=>C(e,[c(t),d(n),r??[]],i),ie=e=>e.fragmented?C(`ftyp`,[v(`iso5`),f(512),v(`iso5`),v(`iso6`),v(`mp41`)]):C(`ftyp`,[v(`isom`),f(512),v(`isom`),e.holdsAvc?v(`avc1`):[],v(`mp41`)]),ae=e=>({type:`mdat`,largeSize:e}),oe=e=>({type:`free`,size:e}),se=(e,t,n=!1)=>C(`moov`,null,[ce(t,e),...e.map(e=>le(e,t)),n?Be(e):null]),ce=(e,t)=>{let n=b(Math.max(0,...t.filter(e=>e.samples.length>0).map(e=>{let t=ee(e.samples);return t.presentationTimestamp+t.duration})),Ct),r=Math.max(...t.map(e=>e.id))+1,i=!S(e)||!S(n),a=i?m:f;return w(`mvhd`,+i,0,[a(e),a(e),f(Ct),a(n),g(1),h(1),Array(10).fill(0),re(ne),Array(24).fill(0),f(r)])},le=(e,t)=>C(`trak`,null,[ue(e,t),de(e,t)]),ue=(e,t)=>{let n=ee(e.samples),r=b(n?n.presentationTimestamp+n.duration:0,Ct),i=!S(t)||!S(r),a=i?m:f,o;return o=e.info.type===`video`?typeof e.info.rotation==`number`?te(e.info.rotation):e.info.rotation:ne,w(`tkhd`,+i,3,[a(t),a(t),f(e.id),f(0),a(r),Array(8).fill(0),l(0),l(0),h(+(e.info.type===`audio`)),l(0),re(o),g(e.info.type===`video`?e.info.width:0),g(e.info.type===`video`?e.info.height:0)])},de=(e,t)=>C(`mdia`,null,[fe(e,t),pe(e.info.type===`video`?`vide`:`soun`),me(e)]),fe=(e,t)=>{let n=ee(e.samples),r=b(n?n.presentationTimestamp+n.duration:0,e.timescale),i=!S(t)||!S(r),a=i?m:f;return w(`mdhd`,+i,0,[a(t),a(t),f(e.timescale),a(r),l(21956),l(0)])},pe=e=>w(`hdlr`,0,0,[v(`mhlr`),v(e),f(0),f(0),f(0),v(`mp4-muxer-hdlr`,!0)]),me=e=>C(`minf`,null,[e.info.type===`video`?he():ge(),_e(),be(e)]),he=()=>w(`vmhd`,0,1,[l(0),l(0),l(0),l(0)]),ge=()=>w(`smhd`,0,0,[l(0),l(0)]),_e=()=>C(`dinf`,null,[ve()]),ve=()=>w(`dref`,0,0,[f(1)],[ye()]),ye=()=>w(`url `,0,1),be=e=>{let t=e.compositionTimeOffsetTable.length>1||e.compositionTimeOffsetTable.some(e=>e.sampleCompositionTimeOffset!==0);return C(`stbl`,null,[xe(e),Pe(e),Fe(e),Ie(e),Le(e),Re(e),t?ze(e):null])},xe=e=>w(`stsd`,0,0,[f(1)],[e.info.type===`video`?Se(Qe[e.info.codec],e):je(et[e.info.codec],e)]),Se=(e,t)=>C(e,[[,,,,,,].fill(0),l(1),l(0),l(0),Array(12).fill(0),l(t.info.width),l(t.info.height),f(4718592),f(4718592),f(0),l(1),Array(32).fill(0),l(24),u(65535)],[$e[t.info.codec](t),t.info.decoderConfig.colorSpace?Ee(t):null]),Ce={bt709:1,bt470bg:5,smpte170m:6},we={bt709:1,smpte170m:6,"iec61966-2-1":13},Te={rgb:0,bt709:1,bt470bg:5,smpte170m:6},Ee=e=>C(`colr`,[v(`nclx`),l(Ce[e.info.decoderConfig.colorSpace.primaries]),l(we[e.info.decoderConfig.colorSpace.transfer]),l(Te[e.info.decoderConfig.colorSpace.matrix]),c(!!e.info.decoderConfig.colorSpace.fullRange<<7)]),De=e=>e.info.decoderConfig&&C(`avcC`,[...new Uint8Array(e.info.decoderConfig.description)]),Oe=e=>e.info.decoderConfig&&C(`hvcC`,[...new Uint8Array(e.info.decoderConfig.description)]),ke=e=>{if(!e.info.decoderConfig)return null;let t=e.info.decoderConfig;if(!t.colorSpace)throw Error(`'colorSpace' is required in the decoder config for VP9.`);let n=t.codec.split(`.`),r=Number(n[1]),i=Number(n[2]),a=(Number(n[3])<<4)+0+Number(t.colorSpace.fullRange);return w(`vpcC`,1,0,[c(r),c(i),c(a),c(2),c(2),c(2),l(0)])},Ae=()=>C(`av1C`,[129,0,0,0]),je=(e,t)=>C(e,[[,,,,,,].fill(0),l(1),l(0),l(0),f(0),l(t.info.numberOfChannels),l(16),l(0),l(0),g(t.info.sampleRate)],[tt[t.info.codec](t)]),Me=e=>{let t=new Uint8Array(e.info.decoderConfig.description);return w(`esds`,0,0,[f(58753152),c(32+t.byteLength),l(1),c(0),f(75530368),c(18+t.byteLength),c(64),c(21),d(0),f(130071),f(130071),f(92307584),c(t.byteLength),...t,f(109084800),c(1),c(2)])},Ne=e=>{let t=3840,n=0,r=e.info.decoderConfig?.description;if(r){if(r.byteLength<18)throw TypeError(`Invalid decoder description provided for Opus; must be at least 18 bytes long.`);let e=ArrayBuffer.isView(r)?new DataView(r.buffer,r.byteOffset,r.byteLength):new DataView(r);t=e.getUint16(10,!0),n=e.getInt16(14,!0)}return C(`dOps`,[c(0),c(e.info.numberOfChannels),l(t),f(e.info.sampleRate),h(n),c(0)])},Pe=e=>w(`stts`,0,0,[f(e.timeToSampleTable.length),e.timeToSampleTable.map(e=>[f(e.sampleCount),f(e.sampleDelta)])]),Fe=e=>{if(e.samples.every(e=>e.type===`key`))return null;let t=[...e.samples.entries()].filter(([,e])=>e.type===`key`);return w(`stss`,0,0,[f(t.length),t.map(([e])=>f(e+1))])},Ie=e=>w(`stsc`,0,0,[f(e.compactlyCodedChunkTable.length),e.compactlyCodedChunkTable.map(e=>[f(e.firstChunk),f(e.samplesPerChunk),f(1)])]),Le=e=>w(`stsz`,0,0,[f(0),f(e.samples.length),e.samples.map(e=>f(e.size))]),Re=e=>e.finalizedChunks.length>0&&y(e.finalizedChunks).offset>=2**32?w(`co64`,0,0,[f(e.finalizedChunks.length),e.finalizedChunks.map(e=>m(e.offset))]):w(`stco`,0,0,[f(e.finalizedChunks.length),e.finalizedChunks.map(e=>f(e.offset))]),ze=e=>w(`ctts`,0,0,[f(e.compositionTimeOffsetTable.length),e.compositionTimeOffsetTable.map(e=>[f(e.sampleCount),f(e.sampleCompositionTimeOffset)])]),Be=e=>C(`mvex`,null,e.map(Ve)),Ve=e=>w(`trex`,0,0,[f(e.id),f(1),f(0),f(0),f(0)]),He=(e,t)=>C(`moof`,null,[Ue(e),...t.map(Ge)]),Ue=e=>w(`mfhd`,0,0,[f(e)]),We=e=>{let t=0,n=0,r=e.type===`delta`;return n|=+r,t|=r?1:2,t<<24|n<<16|0},Ge=e=>C(`traf`,null,[Ke(e),qe(e),Je(e)]),Ke=e=>{let t=0;t|=8,t|=16,t|=32,t|=131072;let n=e.currentChunk.samples[1]??e.currentChunk.samples[0],r={duration:n.timescaleUnitsToNextSample,size:n.size,flags:We(n)};return w(`tfhd`,0,t,[f(e.id),f(r.duration),f(r.size),f(r.flags)])},qe=e=>w(`tfdt`,1,0,[m(b(e.currentChunk.startTimestamp,e.timescale))]),Je=e=>{let t=e.currentChunk.samples.map(e=>e.timescaleUnitsToNextSample),n=e.currentChunk.samples.map(e=>e.size),r=e.currentChunk.samples.map(We),i=e.currentChunk.samples.map(t=>b(t.presentationTimestamp-t.decodeTimestamp,e.timescale)),a=new Set(t),o=new Set(n),s=new Set(r),c=new Set(i),l=s.size===2&&r[0]!==r[1],u=a.size>1,d=o.size>1,m=!l&&s.size>1,h=c.size>1||[...c].some(e=>e!==0),g=0;return g|=1,g|=4*l,g|=256*u,g|=512*d,g|=1024*m,g|=2048*h,w(`trun`,1,g,[f(e.currentChunk.samples.length),f(e.currentChunk.offset-e.currentChunk.moofOffset||0),l?f(r[0]):[],e.currentChunk.samples.map((e,a)=>[u?f(t[a]):[],d?f(n[a]):[],m?f(r[a]):[],h?p(i[a]):[]])])},Ye=e=>C(`mfra`,null,[...e.map(Xe),Ze()]),Xe=(e,t)=>w(`tfra`,1,0,[f(e.id),f(63),f(e.finalizedChunks.length),e.finalizedChunks.map(n=>[m(b(n.startTimestamp,e.timescale)),m(n.moofOffset),f(t+1),f(1),f(1)])]),Ze=()=>w(`mfro`,0,0,[f(0)]),Qe={avc:`avc1`,hevc:`hvc1`,vp9:`vp09`,av1:`av01`},$e={avc:De,hevc:Oe,vp9:ke,av1:Ae},et={aac:`mp4a`,opus:`Opus`},tt={aac:Me,opus:Ne},nt=class{},rt=class extends nt{constructor(){super(...arguments),this.buffer=null}},it=class extends nt{constructor(e){if(super(),this.options=e,typeof e!=`object`)throw TypeError(`StreamTarget requires an options object to be passed to its constructor.`);if(e.onData){if(typeof e.onData!=`function`)throw TypeError(`options.onData, when provided, must be a function.`);if(e.onData.length<2)throw TypeError(`options.onData, when provided, must be a function that takes in at least two arguments (data and position). Ignoring the position argument, which specifies the byte offset at which the data is to be written, can lead to broken outputs.`)}if(e.chunked!==void 0&&typeof e.chunked!=`boolean`)throw TypeError(`options.chunked, when provided, must be a boolean.`);if(e.chunkSize!==void 0&&(!Number.isInteger(e.chunkSize)||e.chunkSize<1024))throw TypeError(`options.chunkSize, when provided, must be an integer and not smaller than 1024.`)}},at=class extends nt{constructor(e,t){if(super(),this.stream=e,this.options=t,!(e instanceof FileSystemWritableFileStream))throw TypeError(`FileSystemWritableFileStreamTarget requires a FileSystemWritableFileStream instance.`);if(t!==void 0&&typeof t!=`object`)throw TypeError(`FileSystemWritableFileStreamTarget's options, when provided, must be an object.`);if(t&&t.chunkSize!==void 0&&(!Number.isInteger(t.chunkSize)||t.chunkSize<=0))throw TypeError(`options.chunkSize, when provided, must be a positive integer`)}},T,E,ot=class{constructor(){this.pos=0,n(this,T,new Uint8Array(8)),n(this,E,new DataView(t(this,T).buffer)),this.offsets=new WeakMap}seek(e){this.pos=e}writeU32(e){t(this,E).setUint32(0,e,!1),this.write(t(this,T).subarray(0,4))}writeU64(e){t(this,E).setUint32(0,Math.floor(e/2**32),!1),t(this,E).setUint32(4,e,!1),this.write(t(this,T).subarray(0,8))}writeAscii(e){for(let n=0;n<e.length;n++)t(this,E).setUint8(n%8,e.charCodeAt(n)),n%8==7&&this.write(t(this,T));e.length%8!=0&&this.write(t(this,T).subarray(0,e.length%8))}writeBox(e){if(this.offsets.set(e,this.pos),e.contents&&!e.children)this.writeBoxHeader(e,e.size??e.contents.byteLength+8),this.write(e.contents);else{let t=this.pos;if(this.writeBoxHeader(e,0),e.contents&&this.write(e.contents),e.children)for(let t of e.children)t&&this.writeBox(t);let n=this.pos,r=e.size??n-t;this.seek(t),this.writeBoxHeader(e,r),this.seek(n)}}writeBoxHeader(e,t){this.writeU32(e.largeSize?1:t),this.writeAscii(e.type),e.largeSize&&this.writeU64(t)}measureBoxHeader(e){return 8+(e.largeSize?8:0)}patchBox(e){let t=this.pos;this.seek(this.offsets.get(e)),this.writeBox(e),this.seek(t)}measureBox(e){if(e.contents&&!e.children)return this.measureBoxHeader(e)+e.contents.byteLength;{let t=this.measureBoxHeader(e);if(e.contents&&(t+=e.contents.byteLength),e.children)for(let n of e.children)n&&(t+=this.measureBox(n));return t}}};T=new WeakMap,E=new WeakMap;var st,D,O,k,ct,lt,ut=class extends ot{constructor(e){super(),n(this,ct),n(this,st,void 0),n(this,D,new ArrayBuffer(2**16)),n(this,O,new Uint8Array(t(this,D))),n(this,k,0),r(this,st,e)}write(e){a(this,ct,lt).call(this,this.pos+e.byteLength),t(this,O).set(e,this.pos),this.pos+=e.byteLength,r(this,k,Math.max(t(this,k),this.pos))}finalize(){a(this,ct,lt).call(this,this.pos),t(this,st).buffer=t(this,D).slice(0,Math.max(t(this,k),this.pos))}};st=new WeakMap,D=new WeakMap,O=new WeakMap,k=new WeakMap,ct=new WeakSet,lt=function(e){let n=t(this,D).byteLength;for(;n<e;)n*=2;if(n===t(this,D).byteLength)return;let i=new ArrayBuffer(n),a=new Uint8Array(i);a.set(t(this,O),0),r(this,D,i),r(this,O,a)};var dt=2**24,ft=2,A,j,pt,M,N,mt,ht,gt,_t,vt,yt,P,bt,xt=class extends ot{constructor(e){super(),n(this,mt),n(this,gt),n(this,vt),n(this,P),n(this,A,void 0),n(this,j,[]),n(this,pt,void 0),n(this,M,void 0),n(this,N,[]),r(this,A,e),r(this,pt,e.options?.chunked??!1),r(this,M,e.options?.chunkSize??dt)}write(e){t(this,j).push({data:e.slice(),start:this.pos}),this.pos+=e.byteLength}flush(){if(t(this,j).length===0)return;let e=[],n=[...t(this,j)].sort((e,t)=>e.start-t.start);e.push({start:n[0].start,size:n[0].data.byteLength});for(let t=1;t<n.length;t++){let r=e[e.length-1],i=n[t];i.start<=r.start+r.size?r.size=Math.max(r.size,i.start+i.data.byteLength-r.start):e.push({start:i.start,size:i.data.byteLength})}for(let n of e){n.data=new Uint8Array(n.size);for(let e of t(this,j))n.start<=e.start&&e.start<n.start+n.size&&n.data.set(e.data,e.start-n.start);t(this,pt)?(a(this,mt,ht).call(this,n.data,n.start),a(this,P,bt).call(this)):t(this,A).options.onData?.(n.data,n.start)}t(this,j).length=0}finalize(){t(this,pt)&&a(this,P,bt).call(this,!0)}};A=new WeakMap,j=new WeakMap,pt=new WeakMap,M=new WeakMap,N=new WeakMap,mt=new WeakSet,ht=function(e,n){let r=t(this,N).findIndex(e=>e.start<=n&&n<e.start+t(this,M));r===-1&&(r=a(this,vt,yt).call(this,n));let i=t(this,N)[r],o=n-i.start,s=e.subarray(0,Math.min(t(this,M)-o,e.byteLength));i.data.set(s,o);let c={start:o,end:o+s.byteLength};if(a(this,gt,_t).call(this,i,c),i.written[0].start===0&&i.written[0].end===t(this,M)&&(i.shouldFlush=!0),t(this,N).length>ft){for(let e=0;e<t(this,N).length-1;e++)t(this,N)[e].shouldFlush=!0;a(this,P,bt).call(this)}s.byteLength<e.byteLength&&a(this,mt,ht).call(this,e.subarray(s.byteLength),n+s.byteLength)},gt=new WeakSet,_t=function(e,t){let n=0,r=e.written.length-1,i=-1;for(;n<=r;){let a=Math.floor(n+(r-n+1)/2);e.written[a].start<=t.start?(n=a+1,i=a):r=a-1}for(e.written.splice(i+1,0,t),(i===-1||e.written[i].end<t.start)&&i++;i<e.written.length-1&&e.written[i].end>=e.written[i+1].start;)e.written[i].end=Math.max(e.written[i].end,e.written[i+1].end),e.written.splice(i+1,1)},vt=new WeakSet,yt=function(e){let n={start:Math.floor(e/t(this,M))*t(this,M),data:new Uint8Array(t(this,M)),written:[],shouldFlush:!1};return t(this,N).push(n),t(this,N).sort((e,t)=>e.start-t.start),t(this,N).indexOf(n)},P=new WeakSet,bt=function(e=!1){for(let n=0;n<t(this,N).length;n++){let r=t(this,N)[n];if(!(!r.shouldFlush&&!e)){for(let e of r.written)t(this,A).options.onData?.(r.data.subarray(e.start,e.end),r.start+e.start);t(this,N).splice(n--,1)}}};var St=class extends xt{constructor(e){super(new it({onData:(t,n)=>e.stream.write({type:`write`,data:t,position:n}),chunked:!0,chunkSize:e.options?.chunkSize}))}},Ct=1e3,wt=[`avc`,`hevc`,`vp9`,`av1`],Tt=[`aac`,`opus`],Et=2082844800,Dt=[`strict`,`offset`,`cross-track-offset`],F,I,Ot,L,R,z,B,V,kt,H,U,W,At,jt,Mt,Nt,Pt,Ft,It,Lt,Rt,zt,Bt,Vt,G,K,Ht,Ut,q,Wt,Gt,Kt,J,Y,qt,Jt,Yt=class{constructor(e){if(n(this,At),n(this,Mt),n(this,Pt),n(this,It),n(this,Rt),n(this,Bt),n(this,G),n(this,Ht),n(this,q),n(this,Gt),n(this,J),n(this,qt),n(this,F,void 0),n(this,I,void 0),n(this,Ot,void 0),n(this,L,void 0),n(this,R,null),n(this,z,null),n(this,B,Math.floor(Date.now()/1e3)+Et),n(this,V,[]),n(this,kt,1),n(this,H,[]),n(this,U,[]),n(this,W,!1),a(this,At,jt).call(this,e),e.video=x(e.video),e.audio=x(e.audio),e.fastStart=x(e.fastStart),this.target=e.target,r(this,F,{firstTimestampBehavior:`strict`,...e}),e.target instanceof rt)r(this,I,new ut(e.target));else if(e.target instanceof it)r(this,I,new xt(e.target));else if(e.target instanceof at)r(this,I,new St(e.target));else throw Error(`Invalid target: ${e.target}`);a(this,It,Lt).call(this),a(this,Mt,Nt).call(this)}addVideoChunk(e,t,n,r){if(!(e instanceof EncodedVideoChunk))throw TypeError(`addVideoChunk's first argument (sample) must be of type EncodedVideoChunk.`);if(t&&typeof t!=`object`)throw TypeError(`addVideoChunk's second argument (meta), when provided, must be an object.`);if(n!==void 0&&(!Number.isFinite(n)||n<0))throw TypeError(`addVideoChunk's third argument (timestamp), when provided, must be a non-negative real number.`);if(r!==void 0&&!Number.isFinite(r))throw TypeError(`addVideoChunk's fourth argument (compositionTimeOffset), when provided, must be a real number.`);let i=new Uint8Array(e.byteLength);e.copyTo(i),this.addVideoChunkRaw(i,e.type,n??e.timestamp,e.duration,t,r)}addVideoChunkRaw(e,n,r,i,o,s){if(!(e instanceof Uint8Array))throw TypeError(`addVideoChunkRaw's first argument (data) must be an instance of Uint8Array.`);if(n!==`key`&&n!==`delta`)throw TypeError(`addVideoChunkRaw's second argument (type) must be either 'key' or 'delta'.`);if(!Number.isFinite(r)||r<0)throw TypeError(`addVideoChunkRaw's third argument (timestamp) must be a non-negative real number.`);if(!Number.isFinite(i)||i<0)throw TypeError(`addVideoChunkRaw's fourth argument (duration) must be a non-negative real number.`);if(o&&typeof o!=`object`)throw TypeError(`addVideoChunkRaw's fifth argument (meta), when provided, must be an object.`);if(s!==void 0&&!Number.isFinite(s))throw TypeError(`addVideoChunkRaw's sixth argument (compositionTimeOffset), when provided, must be a real number.`);if(a(this,qt,Jt).call(this),!t(this,F).video)throw Error(`No video track declared.`);if(typeof t(this,F).fastStart==`object`&&t(this,R).samples.length===t(this,F).fastStart.expectedVideoChunks)throw Error(`Cannot add more video chunks than specified in 'fastStart' (${t(this,F).fastStart.expectedVideoChunks}).`);let c=a(this,Bt,Vt).call(this,t(this,R),e,n,r,i,o,s);if(t(this,F).fastStart===`fragmented`&&t(this,z)){for(;t(this,U).length>0&&t(this,U)[0].decodeTimestamp<=c.decodeTimestamp;){let e=t(this,U).shift();a(this,G,K).call(this,t(this,z),e)}c.decodeTimestamp<=t(this,z).lastDecodeTimestamp?a(this,G,K).call(this,t(this,R),c):t(this,H).push(c)}else a(this,G,K).call(this,t(this,R),c)}addAudioChunk(e,t,n){if(!(e instanceof EncodedAudioChunk))throw TypeError(`addAudioChunk's first argument (sample) must be of type EncodedAudioChunk.`);if(t&&typeof t!=`object`)throw TypeError(`addAudioChunk's second argument (meta), when provided, must be an object.`);if(n!==void 0&&(!Number.isFinite(n)||n<0))throw TypeError(`addAudioChunk's third argument (timestamp), when provided, must be a non-negative real number.`);let r=new Uint8Array(e.byteLength);e.copyTo(r),this.addAudioChunkRaw(r,e.type,n??e.timestamp,e.duration,t)}addAudioChunkRaw(e,n,r,i,o){if(!(e instanceof Uint8Array))throw TypeError(`addAudioChunkRaw's first argument (data) must be an instance of Uint8Array.`);if(n!==`key`&&n!==`delta`)throw TypeError(`addAudioChunkRaw's second argument (type) must be either 'key' or 'delta'.`);if(!Number.isFinite(r)||r<0)throw TypeError(`addAudioChunkRaw's third argument (timestamp) must be a non-negative real number.`);if(!Number.isFinite(i)||i<0)throw TypeError(`addAudioChunkRaw's fourth argument (duration) must be a non-negative real number.`);if(o&&typeof o!=`object`)throw TypeError(`addAudioChunkRaw's fifth argument (meta), when provided, must be an object.`);if(a(this,qt,Jt).call(this),!t(this,F).audio)throw Error(`No audio track declared.`);if(typeof t(this,F).fastStart==`object`&&t(this,z).samples.length===t(this,F).fastStart.expectedAudioChunks)throw Error(`Cannot add more audio chunks than specified in 'fastStart' (${t(this,F).fastStart.expectedAudioChunks}).`);let s=a(this,Bt,Vt).call(this,t(this,z),e,n,r,i,o);if(t(this,F).fastStart===`fragmented`&&t(this,R)){for(;t(this,H).length>0&&t(this,H)[0].decodeTimestamp<=s.decodeTimestamp;){let e=t(this,H).shift();a(this,G,K).call(this,t(this,R),e)}s.decodeTimestamp<=t(this,R).lastDecodeTimestamp?a(this,G,K).call(this,t(this,z),s):t(this,U).push(s)}else a(this,G,K).call(this,t(this,z),s)}finalize(){if(t(this,W))throw Error(`Cannot finalize a muxer more than once.`);if(t(this,F).fastStart===`fragmented`){for(let e of t(this,H))a(this,G,K).call(this,t(this,R),e);for(let e of t(this,U))a(this,G,K).call(this,t(this,z),e);a(this,Gt,Kt).call(this,!1)}else t(this,R)&&a(this,q,Wt).call(this,t(this,R)),t(this,z)&&a(this,q,Wt).call(this,t(this,z));let e=[t(this,R),t(this,z)].filter(Boolean);if(t(this,F).fastStart===`in-memory`){let n;for(let r=0;r<2;r++){let r=se(e,t(this,B)),i=t(this,I).measureBox(r);n=t(this,I).measureBox(t(this,L));let a=t(this,I).pos+i+n;for(let e of t(this,V)){e.offset=a;for(let{data:t}of e.samples)a+=t.byteLength,n+=t.byteLength}if(a<2**32)break;n>=2**32&&(t(this,L).largeSize=!0)}let r=se(e,t(this,B));t(this,I).writeBox(r),t(this,L).size=n,t(this,I).writeBox(t(this,L));for(let e of t(this,V))for(let n of e.samples)t(this,I).write(n.data),n.data=null}else if(t(this,F).fastStart===`fragmented`){let n=t(this,I).pos,r=Ye(e);t(this,I).writeBox(r);let i=t(this,I).pos-n;t(this,I).seek(t(this,I).pos-4),t(this,I).writeU32(i)}else{let n=t(this,I).offsets.get(t(this,L)),r=t(this,I).pos-n;t(this,L).size=r,t(this,L).largeSize=r>=2**32,t(this,I).patchBox(t(this,L));let i=se(e,t(this,B));if(typeof t(this,F).fastStart==`object`){t(this,I).seek(t(this,Ot)),t(this,I).writeBox(i);let e=n-t(this,I).pos;t(this,I).writeBox(oe(e))}else t(this,I).writeBox(i)}a(this,J,Y).call(this),t(this,I).finalize(),r(this,W,!0)}};F=new WeakMap,I=new WeakMap,Ot=new WeakMap,L=new WeakMap,R=new WeakMap,z=new WeakMap,B=new WeakMap,V=new WeakMap,kt=new WeakMap,H=new WeakMap,U=new WeakMap,W=new WeakMap,At=new WeakSet,jt=function(e){if(typeof e!=`object`)throw TypeError(`The muxer requires an options object to be passed to its constructor.`);if(!(e.target instanceof nt))throw TypeError(`The target must be provided and an instance of Target.`);if(e.video){if(!wt.includes(e.video.codec))throw TypeError(`Unsupported video codec: ${e.video.codec}`);if(!Number.isInteger(e.video.width)||e.video.width<=0)throw TypeError(`Invalid video width: ${e.video.width}. Must be a positive integer.`);if(!Number.isInteger(e.video.height)||e.video.height<=0)throw TypeError(`Invalid video height: ${e.video.height}. Must be a positive integer.`);let t=e.video.rotation;if(typeof t==`number`&&![0,90,180,270].includes(t))throw TypeError(`Invalid video rotation: ${t}. Has to be 0, 90, 180 or 270.`);if(Array.isArray(t)&&(t.length!==9||t.some(e=>typeof e!=`number`)))throw TypeError(`Invalid video transformation matrix: ${t.join()}`);if(e.video.frameRate!==void 0&&(!Number.isInteger(e.video.frameRate)||e.video.frameRate<=0))throw TypeError(`Invalid video frame rate: ${e.video.frameRate}. Must be a positive integer.`)}if(e.audio){if(!Tt.includes(e.audio.codec))throw TypeError(`Unsupported audio codec: ${e.audio.codec}`);if(!Number.isInteger(e.audio.numberOfChannels)||e.audio.numberOfChannels<=0)throw TypeError(`Invalid number of audio channels: ${e.audio.numberOfChannels}. Must be a positive integer.`);if(!Number.isInteger(e.audio.sampleRate)||e.audio.sampleRate<=0)throw TypeError(`Invalid audio sample rate: ${e.audio.sampleRate}. Must be a positive integer.`)}if(e.firstTimestampBehavior&&!Dt.includes(e.firstTimestampBehavior))throw TypeError(`Invalid first timestamp behavior: ${e.firstTimestampBehavior}`);if(typeof e.fastStart==`object`){if(e.video){if(e.fastStart.expectedVideoChunks===void 0)throw TypeError(`'fastStart' is an object but is missing property 'expectedVideoChunks'.`);if(!Number.isInteger(e.fastStart.expectedVideoChunks)||e.fastStart.expectedVideoChunks<0)throw TypeError(`'expectedVideoChunks' must be a non-negative integer.`)}if(e.audio){if(e.fastStart.expectedAudioChunks===void 0)throw TypeError(`'fastStart' is an object but is missing property 'expectedAudioChunks'.`);if(!Number.isInteger(e.fastStart.expectedAudioChunks)||e.fastStart.expectedAudioChunks<0)throw TypeError(`'expectedAudioChunks' must be a non-negative integer.`)}}else if(![!1,`in-memory`,`fragmented`].includes(e.fastStart))throw TypeError(`'fastStart' option must be false, 'in-memory', 'fragmented' or an object.`);if(e.minFragmentDuration!==void 0&&(!Number.isFinite(e.minFragmentDuration)||e.minFragmentDuration<0))throw TypeError(`'minFragmentDuration' must be a non-negative number.`)},Mt=new WeakSet,Nt=function(){if(t(this,I).writeBox(ie({holdsAvc:t(this,F).video?.codec===`avc`,fragmented:t(this,F).fastStart===`fragmented`})),r(this,Ot,t(this,I).pos),t(this,F).fastStart===`in-memory`)r(this,L,ae(!1));else if(t(this,F).fastStart!==`fragmented`){if(typeof t(this,F).fastStart==`object`){let e=a(this,Pt,Ft).call(this);t(this,I).seek(t(this,I).pos+e)}r(this,L,ae(!0)),t(this,I).writeBox(t(this,L))}a(this,J,Y).call(this)},Pt=new WeakSet,Ft=function(){if(typeof t(this,F).fastStart!=`object`)return;let e=0,n=[t(this,F).fastStart.expectedVideoChunks,t(this,F).fastStart.expectedAudioChunks];for(let t of n)t&&(e+=8*Math.ceil(2/3*t),e+=4*t,e+=12*Math.ceil(2/3*t),e+=4*t,e+=8*t);return e+=4096,e},It=new WeakSet,Lt=function(){if(t(this,F).video&&r(this,R,{id:1,info:{type:`video`,codec:t(this,F).video.codec,width:t(this,F).video.width,height:t(this,F).video.height,rotation:t(this,F).video.rotation??0,decoderConfig:null},timescale:t(this,F).video.frameRate??57600,samples:[],finalizedChunks:[],currentChunk:null,firstDecodeTimestamp:void 0,lastDecodeTimestamp:-1,timeToSampleTable:[],compositionTimeOffsetTable:[],lastTimescaleUnits:null,lastSample:null,compactlyCodedChunkTable:[]}),t(this,F).audio&&(r(this,z,{id:t(this,F).video?2:1,info:{type:`audio`,codec:t(this,F).audio.codec,numberOfChannels:t(this,F).audio.numberOfChannels,sampleRate:t(this,F).audio.sampleRate,decoderConfig:null},timescale:t(this,F).audio.sampleRate,samples:[],finalizedChunks:[],currentChunk:null,firstDecodeTimestamp:void 0,lastDecodeTimestamp:-1,timeToSampleTable:[],compositionTimeOffsetTable:[],lastTimescaleUnits:null,lastSample:null,compactlyCodedChunkTable:[]}),t(this,F).audio.codec===`aac`)){let e=a(this,Rt,zt).call(this,2,t(this,F).audio.sampleRate,t(this,F).audio.numberOfChannels);t(this,z).info.decoderConfig={codec:t(this,F).audio.codec,description:e,numberOfChannels:t(this,F).audio.numberOfChannels,sampleRate:t(this,F).audio.sampleRate}}},Rt=new WeakSet,zt=function(e,t,n){let r=[96e3,88200,64e3,48e3,44100,32e3,24e3,22050,16e3,12e3,11025,8e3,7350].indexOf(t),i=n,a=``;a+=e.toString(2).padStart(5,`0`),a+=r.toString(2).padStart(4,`0`),r===15&&(a+=t.toString(2).padStart(24,`0`)),a+=i.toString(2).padStart(4,`0`);let o=Math.ceil(a.length/8)*8;a=a.padEnd(o,`0`);let s=new Uint8Array(a.length/8);for(let e=0;e<a.length;e+=8)s[e/8]=parseInt(a.slice(e,e+8),2);return s},Bt=new WeakSet,Vt=function(e,t,n,r,i,o,s){let c=r/1e6,l=(r-(s??0))/1e6,u=i/1e6,d=a(this,Ht,Ut).call(this,c,l,e);return c=d.presentationTimestamp,l=d.decodeTimestamp,o?.decoderConfig&&(e.info.decoderConfig===null?e.info.decoderConfig=o.decoderConfig:Object.assign(e.info.decoderConfig,o.decoderConfig)),{presentationTimestamp:c,decodeTimestamp:l,duration:u,data:t,size:t.byteLength,type:n,timescaleUnitsToNextSample:b(u,e.timescale)}},G=new WeakSet,K=function(e,n){t(this,F).fastStart!==`fragmented`&&e.samples.push(n);let r=b(n.presentationTimestamp-n.decodeTimestamp,e.timescale);if(e.lastTimescaleUnits!==null){let i=b(n.decodeTimestamp,e.timescale,!1),a=Math.round(i-e.lastTimescaleUnits);if(e.lastTimescaleUnits+=a,e.lastSample.timescaleUnitsToNextSample=a,t(this,F).fastStart!==`fragmented`){let t=y(e.timeToSampleTable);t.sampleCount===1?(t.sampleDelta=a,t.sampleCount++):t.sampleDelta===a?t.sampleCount++:(t.sampleCount--,e.timeToSampleTable.push({sampleCount:2,sampleDelta:a}));let n=y(e.compositionTimeOffsetTable);n.sampleCompositionTimeOffset===r?n.sampleCount++:e.compositionTimeOffsetTable.push({sampleCount:1,sampleCompositionTimeOffset:r})}}else e.lastTimescaleUnits=0,t(this,F).fastStart!==`fragmented`&&(e.timeToSampleTable.push({sampleCount:1,sampleDelta:b(n.duration,e.timescale)}),e.compositionTimeOffsetTable.push({sampleCount:1,sampleCompositionTimeOffset:r}));e.lastSample=n;let i=!1;if(!e.currentChunk)i=!0;else{let r=n.presentationTimestamp-e.currentChunk.startTimestamp;if(t(this,F).fastStart===`fragmented`){let o=t(this,R)??t(this,z),s=t(this,F).minFragmentDuration??1;e===o&&n.type===`key`&&r>=s&&(i=!0,a(this,Gt,Kt).call(this))}else i=r>=.5}i&&(e.currentChunk&&a(this,q,Wt).call(this,e),e.currentChunk={startTimestamp:n.presentationTimestamp,samples:[]}),e.currentChunk.samples.push(n)},Ht=new WeakSet,Ut=function(e,n,r){let i=t(this,F).firstTimestampBehavior===`strict`,a=r.lastDecodeTimestamp===-1;if(i&&a&&n!==0)throw Error(`The first chunk for your media track must have a timestamp of 0 (received DTS=${n}).Non-zero first timestamps are often caused by directly piping frames or audio data from a MediaStreamTrack into the encoder. Their timestamps are typically relative to the age of thedocument, which is probably what you want.

If you want to offset all timestamps of a track such that the first one is zero, set firstTimestampBehavior: 'offset' in the options.
`);if(t(this,F).firstTimestampBehavior===`offset`||t(this,F).firstTimestampBehavior===`cross-track-offset`){r.firstDecodeTimestamp===void 0&&(r.firstDecodeTimestamp=n);let i;i=t(this,F).firstTimestampBehavior===`offset`?r.firstDecodeTimestamp:Math.min(t(this,R)?.firstDecodeTimestamp??1/0,t(this,z)?.firstDecodeTimestamp??1/0),n-=i,e-=i}if(n<r.lastDecodeTimestamp)throw Error(`Timestamps must be monotonically increasing (DTS went from ${r.lastDecodeTimestamp*1e6} to ${n*1e6}).`);return r.lastDecodeTimestamp=n,{presentationTimestamp:e,decodeTimestamp:n}},q=new WeakSet,Wt=function(e){if(t(this,F).fastStart===`fragmented`)throw Error(`Can't finalize individual chunks if 'fastStart' is set to 'fragmented'.`);if(e.currentChunk){if(e.finalizedChunks.push(e.currentChunk),t(this,V).push(e.currentChunk),(e.compactlyCodedChunkTable.length===0||y(e.compactlyCodedChunkTable).samplesPerChunk!==e.currentChunk.samples.length)&&e.compactlyCodedChunkTable.push({firstChunk:e.finalizedChunks.length,samplesPerChunk:e.currentChunk.samples.length}),t(this,F).fastStart===`in-memory`){e.currentChunk.offset=0;return}e.currentChunk.offset=t(this,I).pos;for(let n of e.currentChunk.samples)t(this,I).write(n.data),n.data=null;a(this,J,Y).call(this)}},Gt=new WeakSet,Kt=function(e=!0){if(t(this,F).fastStart!==`fragmented`)throw Error(`Can't finalize a fragment unless 'fastStart' is set to 'fragmented'.`);let n=[t(this,R),t(this,z)].filter(e=>e&&e.currentChunk);if(n.length===0)return;let r=i(this,kt)._++;if(r===1){let e=se(n,t(this,B),!0);t(this,I).writeBox(e)}let o=t(this,I).pos,s=He(r,n);t(this,I).writeBox(s);{let e=ae(!1),r=0;for(let e of n)for(let t of e.currentChunk.samples)r+=t.size;let i=t(this,I).measureBox(e)+r;i>=2**32&&(e.largeSize=!0,i=t(this,I).measureBox(e)+r),e.size=i,t(this,I).writeBox(e)}for(let e of n){e.currentChunk.offset=t(this,I).pos,e.currentChunk.moofOffset=o;for(let n of e.currentChunk.samples)t(this,I).write(n.data),n.data=null}let c=t(this,I).pos;t(this,I).seek(t(this,I).offsets.get(s));let l=He(r,n);t(this,I).writeBox(l),t(this,I).seek(c);for(let e of n)e.finalizedChunks.push(e.currentChunk),t(this,V).push(e.currentChunk),e.currentChunk=null;e&&a(this,J,Y).call(this)},J=new WeakSet,Y=function(){t(this,I)instanceof xt&&t(this,I).flush()},qt=new WeakSet,Jt=function(){if(t(this,W))throw Error(`Cannot add new video or audio chunks after the file has been finalized.`)};var Xt=class{static async detectBackend(){if(typeof navigator<`u`&&navigator.gpu)try{if(await navigator.gpu.requestAdapter())return`webgpu`}catch{}let e=document.createElement(`canvas`);return e.getContext(`webgl2`)?`webgl2`:e.getContext(`webgl`)||e.getContext(`experimental-webgl`)?`webgl`:`none`}constructor(e){if(this.canvas=e,this.gl=e.getContext(`webgl2`,{preserveDrawingBuffer:!0,antialias:!1,alpha:!1,depth:!1,stencil:!1,powerPreference:`high-performance`}),this.isWebGL2=!!this.gl,this.gl||=e.getContext(`webgl`,{preserveDrawingBuffer:!0,alpha:!1})||e.getContext(`experimental-webgl`,{preserveDrawingBuffer:!0,alpha:!1}),!this.gl)throw Error(`WebGL is not supported on this browser or device.`);let t=this.gl;this.isContextLost=!1,e.addEventListener(`webglcontextlost`,e=>{e.preventDefault(),console.warn(`[Utkarsh AI] WebGL Context Lost! GPU recovery initiated...`),this.isContextLost=!0},!1),e.addEventListener(`webglcontextrestored`,()=>{console.log(`[Utkarsh AI] WebGL Context Restored! Rebuilding GPU pipeline...`),this.isContextLost=!1,this._initPrograms(),this._initVAO(),this._initTextures(),this._initFBO(),this._lastDstW=0,this._lastSrcW=0},!1),this.hasFloatFBO=this.isWebGL2?!!t.getExtension(`EXT_color_buffer_float`):!!(t.getExtension(`WEBGL_color_buffer_float`)||t.getExtension(`EXT_color_buffer_half_float`)),this._initPrograms(),this._initVAO(),this._initTextures(),this._initFBO(),this._lastSrcW=0,this._lastSrcH=0,this._lastDstW=0,this._lastDstH=0,this._frameIndex=0}_vsFirstPass(){return this.isWebGL2?`#version 300 es
      in vec2 a_pos;
      in vec2 a_uv;
      out vec2 v_uv;
      void main() {
        gl_Position = vec4(a_pos, 0.0, 1.0);
        v_uv = vec2(a_uv.x, 1.0 - a_uv.y);
      }`:`
    attribute vec2 a_pos;
    attribute vec2 a_uv;
    varying vec2 v_uv;
    void main() {
      gl_Position = vec4(a_pos, 0.0, 1.0);
      v_uv = vec2(a_uv.x, 1.0 - a_uv.y);
    }`}_vsFBOPass(){return this.isWebGL2?`#version 300 es
      in vec2 a_pos;
      in vec2 a_uv;
      out vec2 v_uv;
      void main() {
        gl_Position = vec4(a_pos, 0.0, 1.0);
        v_uv = a_uv;
      }`:`
    attribute vec2 a_pos;
    attribute vec2 a_uv;
    varying vec2 v_uv;
    void main() {
      gl_Position = vec4(a_pos, 0.0, 1.0);
      v_uv = a_uv;
    }`}_vsSource(){return this._vsFirstPass()}_fsBlit(){return this.isWebGL2?`#version 300 es
      precision highp float;
      in vec2 v_uv;
      out vec4 fragColor;
      uniform sampler2D u_src;
      void main() {
        fragColor = texture(u_src, v_uv);
      }`:`
    precision highp float;
    varying vec2 v_uv;
    uniform sampler2D u_src;
    void main() {
      gl_FragColor = texture2D(u_src, v_uv);
    }`}_fsEASU(){return this.isWebGL2?`#version 300 es
      precision highp float;
      in vec2 v_uv;
      out vec4 fragColor;

      uniform sampler2D u_src;
      uniform vec2 u_srcSize;
      uniform vec2 u_dstSize;
      uniform int u_swapRB;

      // Lanczos-3 sinc kernel (6-tap radius)
      float lanczos(float x) {
        x = abs(x);
        if (x < 0.0001) return 1.0;
        if (x >= 3.0) return 0.0;
        float px = 3.14159265359 * x;
        float px3 = px / 3.0;
        return (sin(px) / px) * (sin(px3) / px3);
      }

      // Bilateral Deblock filter: removes compression macroblock noise while preserving edges
      vec4 bilateralDeblock(sampler2D tex, vec2 uv, vec2 rcpSrc) {
        vec4 center = texture(tex, uv);
        vec4 sum = center * 4.0;
        float wTotal = 4.0;
        vec2 offsets[4];
        offsets[0] = vec2(-rcpSrc.x, 0.0);
        offsets[1] = vec2( rcpSrc.x, 0.0);
        offsets[2] = vec2(0.0, -rcpSrc.y);
        offsets[3] = vec2(0.0,  rcpSrc.y);

        for (int i = 0; i < 4; i++) {
          vec4 sampleCol = texture(tex, uv + offsets[i]);
          float colorDiff = length(center.rgb - sampleCol.rgb);
          float spatialW = exp(-colorDiff * 12.0); // Edge-preserving weight (tightened for sharper deblock)
          sum += sampleCol * spatialW;
          wTotal += spatialW;
        }
        return sum / wTotal;
      }

      void main() {
        vec2 rcpSrc = 1.0 / u_srcSize;
        vec2 scale  = u_dstSize / u_srcSize;

        // Map destination pixel to source space with 0.5 sub-pixel offset
        vec2 srcPixel = v_uv * u_srcSize - 0.5;
        vec2 fi = floor(srcPixel);
        vec2 frac = srcPixel - fi;

        // 6-tap Lanczos-3 reconstruction with bilateral deblocked samples
        vec4 col = vec4(0.0);
        float wTotal = 0.0;
        vec4 vMin = vec4(1e9);
        vec4 vMax = vec4(-1e9);

        for (int dy = -2; dy <= 3; dy++) {
          float wy = lanczos(float(dy) - frac.y);
          for (int dx = -2; dx <= 3; dx++) {
            float wx = lanczos(float(dx) - frac.x);
            float wt = wx * wy;

            vec2 sampleUV = (fi + vec2(float(dx), float(dy)) + 0.5) * rcpSrc;
            vec4 c = bilateralDeblock(u_src, clamp(sampleUV, vec2(0.0), vec2(1.0)), rcpSrc);

            if (abs(dx) <= 1 && abs(dy) <= 1) {
              vMin = min(vMin, c);
              vMax = max(vMax, c);
            }

            col  += c * wt;
            wTotal += wt;
          }
        }

        col /= max(wTotal, 0.0001);
        col = clamp(col, vMin, vMax); // Deringing clamp

        // ── Deep Neural Sub-Pixel Feature Synthesis ──
        vec4 cC = texture(u_src, v_uv);
        vec4 cN = texture(u_src, v_uv + vec2(0.0, -rcpSrc.y));
        vec4 cS = texture(u_src, v_uv + vec2(0.0,  rcpSrc.y));
        vec4 cE = texture(u_src, v_uv + vec2( rcpSrc.x, 0.0));
        vec4 cW = texture(u_src, v_uv + vec2(-rcpSrc.x, 0.0));

        // Diagonal neighbors for 5x5 sub-pixel convolution
        vec4 cNW = texture(u_src, v_uv + vec2(-rcpSrc.x, -rcpSrc.y));
        vec4 cNE = texture(u_src, v_uv + vec2( rcpSrc.x, -rcpSrc.y));
        vec4 cSW = texture(u_src, v_uv + vec2(-rcpSrc.x,  rcpSrc.y));
        vec4 cSE = texture(u_src, v_uv + vec2( rcpSrc.x,  rcpSrc.y));

        float lumC = dot(cC.rgb, vec3(0.2126, 0.7152, 0.0722));
        float lumN = dot(cN.rgb, vec3(0.2126, 0.7152, 0.0722));
        float lumS = dot(cS.rgb, vec3(0.2126, 0.7152, 0.0722));
        float lumE = dot(cE.rgb, vec3(0.2126, 0.7152, 0.0722));
        float lumW = dot(cW.rgb, vec3(0.2126, 0.7152, 0.0722));

        // Sobel-Laplacian Edge Direction Matrix
        float dH = abs(lumE - lumW);
        float dV = abs(lumN - lumS);
        float dD1 = abs(dot(cNE.rgb, vec3(0.333)) - dot(cSW.rgb, vec3(0.333)));
        float dD2 = abs(dot(cNW.rgb, vec3(0.333)) - dot(cSE.rgb, vec3(0.333)));

        float edgeStrength = clamp((dH + dV + dD1 + dD2) * 5.0, 0.0, 1.0);

        // Sub-pixel residual reconstruction (clean, natural detail synthesis)
        vec4 subpixelResidual = cC + (cC * 4.0 - (cN + cS + cE + cW)) * (0.5 + edgeStrength * 0.6);
        subpixelResidual = clamp(subpixelResidual, vMin * 0.95, vMax * 1.05);

        // Clean AI Upscale Blend
        vec4 finalCol = clamp(mix(col, subpixelResidual, 0.35 + edgeStrength * 0.35), 0.0, 1.0);
        if (u_swapRB == 1) {
          finalCol.rgb = finalCol.bgr; // Fix Blue Video tint (R-B Channel Swap)
        }
        fragColor = finalCol;
      }`:`
    precision highp float;
    varying vec2 v_uv;
    uniform sampler2D u_src;
    uniform vec2 u_srcSize;
    uniform vec2 u_dstSize;
    uniform int u_swapRB;

    void main() {
      vec2 rcpSrc = 1.0 / u_srcSize;
      vec4 cC = texture2D(u_src, v_uv);
      vec4 cN = texture2D(u_src, v_uv + vec2(0.0, -rcpSrc.y));
      vec4 cS = texture2D(u_src, v_uv + vec2(0.0,  rcpSrc.y));
      vec4 cE = texture2D(u_src, v_uv + vec2( rcpSrc.x, 0.0));
      vec4 cW = texture2D(u_src, v_uv + vec2(-rcpSrc.x, 0.0));
      vec4 laplacian = cC - (cN + cS + cE + cW) * 0.25;
      vec4 finalCol = clamp(cC + laplacian * 2.2, 0.0, 1.0);
      if (u_swapRB == 1) {
        finalCol.rgb = finalCol.bgr;
      }
      gl_FragColor = finalCol;
    }`}_fsAnime4K(){return this.isWebGL2?`#version 300 es
      precision highp float;
      in vec2 v_uv;
      out vec4 fragColor;
      
      uniform sampler2D u_src;
      uniform vec2 u_dstSize;
      
      void main() {
        vec2 d = 1.0 / u_dstSize;
        vec4 c = texture(u_src, v_uv);
        
        vec4 t = texture(u_src, v_uv + vec2(0.0, -d.y));
        vec4 b = texture(u_src, v_uv + vec2(0.0, d.y));
        vec4 l = texture(u_src, v_uv + vec2(-d.x, 0.0));
        vec4 r = texture(u_src, v_uv + vec2(d.x, 0.0));
        
        vec4 minCol = min(c, min(t, min(b, min(l, r))));
        
        // Darken edges slightly (vector line thinning)
        float lum = dot(c.rgb, vec3(0.2126, 0.7152, 0.0722));
        float pushStrength = 0.65;
        vec4 finalCol = mix(c, minCol, pushStrength * (1.0 - lum));
        fragColor = clamp(finalCol, 0.0, 1.0);
      }`:`
    precision highp float;
    varying vec2 v_uv;
    uniform sampler2D u_src;
    void main() { gl_FragColor = texture2D(u_src, v_uv); }
    `}_fsDeband(){return this.isWebGL2?`#version 300 es
      precision highp float;
      in vec2 v_uv;
      out vec4 fragColor;

      uniform sampler2D u_src;
      uniform vec2 u_dstSize;
      uniform float u_time;

      // Blue noise hash (low-discrepancy pseudo-random dither)
      float blueNoise(vec2 uv, float t) {
        return fract(sin(dot(uv * u_dstSize + t * 7.13, vec2(127.1, 311.7))) * 43758.5453);
      }

      // Perceptual luma
      float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

      void main() {
        vec2 d = 1.0 / u_dstSize;
        vec4 c = texture(u_src, v_uv);

        // 5-tap cross gradient — measure local gradient magnitude
        vec3 cN = texture(u_src, v_uv + vec2(0.0, -d.y)).rgb;
        vec3 cS = texture(u_src, v_uv + vec2(0.0,  d.y)).rgb;
        vec3 cW = texture(u_src, v_uv + vec2(-d.x, 0.0)).rgb;
        vec3 cE = texture(u_src, v_uv + vec2( d.x, 0.0)).rgb;

        float gN = abs(luma(c.rgb) - luma(cN));
        float gS = abs(luma(c.rgb) - luma(cS));
        float gW = abs(luma(c.rgb) - luma(cW));
        float gE = abs(luma(c.rgb) - luma(cE));
        float maxGrad = max(max(gN, gS), max(gW, gE));

        // Deband only in smooth gradient regions (gradient < 0.04 = likely a band boundary)
        float debandStrength = smoothstep(0.04, 0.0, maxGrad);

        // Average of 4 cardinal neighbours (blend toward smooth gradient)
        vec3 avg = (cN + cS + cW + cE) * 0.25;
        vec3 debanded = mix(c.rgb, avg, debandStrength * 0.55);

        // Add blue-noise temporal dither to break quantization patterns
        float dither = (blueNoise(v_uv, u_time) - 0.5) * (1.0 / 255.0) * 1.5;
        debanded += dither * debandStrength;

        fragColor = vec4(clamp(debanded, 0.0, 1.0), c.a);
      }`:`
    precision highp float;
    varying vec2 v_uv;
    uniform sampler2D u_src;
    void main() { gl_FragColor = texture2D(u_src, v_uv); }
    `}_fsSubPixel(){return this.isWebGL2?`#version 300 es
      precision highp float;
      in vec2 v_uv;
      out vec4 fragColor;

      uniform sampler2D u_src;
      uniform vec2 u_dstSize;
      uniform float u_sharpness;

      float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

      void main() {
        vec2 d = 1.0 / u_dstSize;
        vec4 c  = texture(u_src, v_uv);
        vec3 cC = c.rgb;

        // ── Sobel gradient direction ──
        vec3 cN  = texture(u_src, v_uv + vec2( 0.0,  -d.y)).rgb;
        vec3 cS  = texture(u_src, v_uv + vec2( 0.0,   d.y)).rgb;
        vec3 cW  = texture(u_src, v_uv + vec2(-d.x,   0.0)).rgb;
        vec3 cE  = texture(u_src, v_uv + vec2( d.x,   0.0)).rgb;
        vec3 cNW = texture(u_src, v_uv + vec2(-d.x,  -d.y)).rgb;
        vec3 cNE = texture(u_src, v_uv + vec2( d.x,  -d.y)).rgb;
        vec3 cSW = texture(u_src, v_uv + vec2(-d.x,   d.y)).rgb;
        vec3 cSE = texture(u_src, v_uv + vec2( d.x,   d.y)).rgb;

        float lumC  = luma(cC);
        float gH    = abs(luma(cE) - luma(cW));
        float gV    = abs(luma(cN) - luma(cS));
        float gD1   = abs(luma(cNE) - luma(cSW));
        float gD2   = abs(luma(cNW) - luma(cSE));
        float edgeStrength = clamp((gH + gV + gD1 + gD2) * 5.0, 0.0, 1.0);

        // ── 8-directional deformable offsets (0.5 sub-pixel shift in edge direction) ──
        // Deformable offset: shift sample points by 0.5px in gradient direction
        float gx = luma(cE) - luma(cW);
        float gy = luma(cS) - luma(cN);
        float gLen = max(length(vec2(gx, gy)), 0.0001);
        vec2 gradDir = vec2(gx, gy) / gLen;

        // Deformed sample positions (half-pixel shift along & perp to gradient)
        vec2 offAlong = gradDir * d * 0.5;
        vec2 offPerp  = vec2(-gradDir.y, gradDir.x) * d * 0.5;

        vec3 sA  = texture(u_src, clamp(v_uv + offAlong,            vec2(0.0), vec2(1.0))).rgb;
        vec3 sB  = texture(u_src, clamp(v_uv - offAlong,            vec2(0.0), vec2(1.0))).rgb;
        vec3 sC2 = texture(u_src, clamp(v_uv + offPerp,             vec2(0.0), vec2(1.0))).rgb;
        vec3 sD  = texture(u_src, clamp(v_uv - offPerp,             vec2(0.0), vec2(1.0))).rgb;
        vec3 sE  = texture(u_src, clamp(v_uv + offAlong + offPerp,  vec2(0.0), vec2(1.0))).rgb;
        vec3 sF  = texture(u_src, clamp(v_uv + offAlong - offPerp,  vec2(0.0), vec2(1.0))).rgb;
        vec3 sG  = texture(u_src, clamp(v_uv - offAlong + offPerp,  vec2(0.0), vec2(1.0))).rgb;
        vec3 sH  = texture(u_src, clamp(v_uv - offAlong - offPerp,  vec2(0.0), vec2(1.0))).rgb;

        // Weighted average of 8 deformable taps
        vec3 deformAvg = (sA + sB + sC2 + sD + sE + sF + sG + sH) * 0.125;

        // Sub-pixel residual: synthesize new detail along edges
        vec3 residual = cC - deformAvg;
        float synthGain = u_sharpness * 1.8 * edgeStrength;
        vec3 synthesized = cC + residual * synthGain;

        // Clamp to neighbourhood bounding box (deringing)
        vec3 vMin = min(cC, min(cN, min(cS, min(cW, cE))));
        vec3 vMax = max(cC, max(cN, max(cS, max(cW, cE))));
        synthesized = clamp(synthesized, vMin * 0.94, vMax * 1.06);

        // Blend: more synthesis on edges, pass through on flat regions
        fragColor = vec4(clamp(mix(cC, synthesized, edgeStrength * 0.65), 0.0, 1.0), c.a);
      }`:`
    precision highp float;
    varying vec2 v_uv;
    uniform sampler2D u_src;
    void main() { gl_FragColor = texture2D(u_src, v_uv); }
    `}_fsRCAS(){return this.isWebGL2?`#version 300 es
      precision highp float;
      in vec2 v_uv;
      out vec4 fragColor;

      uniform sampler2D u_upscaled;
      uniform vec2 u_dstSize;
      uniform float u_sharpness;
      uniform float u_clarity;
      uniform int   u_modelMode;

      void main() {
        vec2 rcpDst = 1.0 / u_dstSize;

        vec4 cN = texture(u_upscaled, v_uv + vec2( 0.0,       -rcpDst.y));
        vec4 cW = texture(u_upscaled, v_uv + vec2(-rcpDst.x,   0.0     ));
        vec4 cC = texture(u_upscaled, v_uv);
        vec4 cE = texture(u_upscaled, v_uv + vec2( rcpDst.x,   0.0     ));
        vec4 cS = texture(u_upscaled, v_uv + vec2( 0.0,        rcpDst.y));

        vec4 vMin = min(cC, min(min(cN, cW), min(cE, cS)));
        vec4 vMax = max(cC, max(max(cN, cW), max(cE, cS)));

        vec4 rcpContrast = vec4(1.0) / max(vMax - vMin, vec4(0.0001));
        
        // Pristine contrast-adaptive sharpening (RCAS)
        float sharpAmt = clamp((u_sharpness * 0.95 + u_clarity * 0.70), 0.1, 1.75);
        
        // Model-specific profile tweaks
        if (u_modelMode == 1) { // Real-ESRGAN x4+ (Photorealistic graphics)
          sharpAmt *= 1.35;
        } else if (u_modelMode == 2 || u_modelMode == 4) { // Real-ESRGAN Anime / CUGAN (2D Art)
          sharpAmt *= 1.1;
        } else if (u_modelMode == 3) { // CodeFormer / Proteus (Faces)
          sharpAmt *= 0.95;
        }

        vec4 amp = clamp(min(vMin, vec4(1.0) - vMax) * rcpContrast, 0.0, 1.0);
        float rcasW = -(1.0 / (sqrt(amp.r + amp.g + amp.b + 0.0001) * (sharpAmt * 4.0 + 0.2)));

        float wBase = 1.0 - rcasW * 4.0;
        vec4 rcasCol = (cN + cW + cE + cS) * rcasW + cC * wBase;

        // For Anime / CUGAN, preserve line art contours with less noise
        float mixRatio = (u_modelMode == 2 || u_modelMode == 4) ? 0.45 : (u_modelMode == 1 ? 0.80 : 0.65);
        
        // RCAS is already contrast adaptive. Do NOT add a laplacian high-pass on top
        // which causes deep-fried double-sharpening halos.
        fragColor = clamp(rcasCol, 0.0, 1.0);
      }`:`
    precision highp float;
    varying vec2 v_uv;
    uniform sampler2D u_upscaled;
    uniform vec2 u_dstSize;
    uniform float u_sharpness;
    uniform float u_clarity;

    void main() {
      vec2 rcpDst = 1.0 / u_dstSize;
      vec4 cN = texture2D(u_upscaled, v_uv + vec2( 0.0,       -rcpDst.y));
      vec4 cW = texture2D(u_upscaled, v_uv + vec2(-rcpDst.x,   0.0     ));
      vec4 cC = texture2D(u_upscaled, v_uv);
      vec4 cE = texture2D(u_upscaled, v_uv + vec2( rcpDst.x,   0.0     ));
      vec4 cS = texture2D(u_upscaled, v_uv + vec2( 0.0,        rcpDst.y));

      vec4 laplacian = cC - (cN + cW + cE + cS) * 0.25;
      // Clean sharpening for WebGL1
      float mult = (u_sharpness * 1.2 + u_clarity * 0.8) * 0.5; 
      gl_FragColor = clamp(cC + laplacian * mult, 0.0, 1.0);
    }`}_fsColor(){return this.isWebGL2?`#version 300 es
      precision highp float;
      in vec2 v_uv;
      out vec4 fragColor;

      uniform sampler2D u_sharpened;
      uniform float u_hdr;
      uniform float u_temp;
      uniform float u_grain;
      uniform int   u_lutMode;
      uniform float u_time;
      uniform float u_chroma;  // Chromatic aberration intensity (0.0 - 1.0)
      uniform float u_bloom;   // Bloom intensity (0.0 - 1.0)
      uniform vec2  u_dstSize;

      // ── Utilities ──────────────────────────────────────────────
      float hash(vec2 p) {
        p = fract(p * vec2(234.34, 435.345));
        p += dot(p, p + 34.23);
        return fract(p.x * p.y);
      }

      float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

      // Dual-ACES: filmic S-curve (dark lift) + Reinhard peak clamp
      vec3 aces(vec3 x) {
        // ACES approximation (Narkowicz 2015)
        const float a = 2.51, c2 = 2.43;
        vec3 b = vec3(0.03), d = vec3(0.59), e2 = vec3(0.14);
        vec3 acesCol = clamp((x * (a * x + b)) / (x * (c2 * x + d) + e2), 0.0, 1.0);
        // Reinhard on luminance channel only — prevents colour shift at peaks
        float lumX = luma(x);
        float reinhardScale = lumX / max(lumX + 1.0, 0.0001);
        return mix(acesCol, x * reinhardScale / max(lumX, 0.0001), smoothstep(0.6, 1.0, lumX));
      }

      // Perceptual Vibrance: boosts low-saturation colours, leaves high-sat colours untouched
      vec3 vibrance(vec3 c, float strength) {
        float maxC = max(c.r, max(c.g, c.b));
        float minC = min(c.r, min(c.g, c.b));
        float sat = (maxC - minC) / max(maxC, 0.0001);
        float vibranceMask = 1.0 - sat; // Protect already-saturated pixels
        float lumV = luma(c);
        return mix(vec3(lumV), c, 1.0 + strength * vibranceMask * 0.9);
      }

      // Single-Pass Bloom: 13-tap cross + diagonal gather on bright regions
      vec3 bloom(vec2 uv, float intensity) {
        if (intensity <= 0.001) return vec3(0.0);
        vec2 d = 1.0 / u_dstSize;
        vec3 acc = vec3(0.0);
        float wTotal = 0.0;

        // 13-tap weighted gather (cross + diagonals + center)
        vec2 offsets[13];
        float weights[13];
        offsets[0]  = vec2( 0.0,  0.0); weights[0]  = 4.0;
        offsets[1]  = vec2(-1.0,  0.0); weights[1]  = 2.0;
        offsets[2]  = vec2( 1.0,  0.0); weights[2]  = 2.0;
        offsets[3]  = vec2( 0.0, -1.0); weights[3]  = 2.0;
        offsets[4]  = vec2( 0.0,  1.0); weights[4]  = 2.0;
        offsets[5]  = vec2(-2.0,  0.0); weights[5]  = 1.0;
        offsets[6]  = vec2( 2.0,  0.0); weights[6]  = 1.0;
        offsets[7]  = vec2( 0.0, -2.0); weights[7]  = 1.0;
        offsets[8]  = vec2( 0.0,  2.0); weights[8]  = 1.0;
        offsets[9]  = vec2(-1.0, -1.0); weights[9]  = 1.0;
        offsets[10] = vec2( 1.0, -1.0); weights[10] = 1.0;
        offsets[11] = vec2(-1.0,  1.0); weights[11] = 1.0;
        offsets[12] = vec2( 1.0,  1.0); weights[12] = 1.0;

        for (int i = 0; i < 13; i++) {
          vec3 s = texture(u_sharpened, clamp(uv + offsets[i] * d * 3.0, vec2(0.0), vec2(1.0))).rgb;
          // Only contribute if pixel is above bloom threshold (bright areas only)
          float brightness = luma(s);
          float threshold = smoothstep(0.55, 0.85, brightness);
          acc += s * threshold * weights[i];
          wTotal += weights[i];
        }
        return (acc / wTotal) * intensity * 0.45;
      }

      void main() {
        vec2 uv = v_uv;

        // ── 1. Chromatic Aberration (radial RGB split from screen centre) ──
        vec3 c;
        if (u_chroma > 0.001) {
          vec2 center = uv - 0.5;
          float dist = length(center);
          float caStrength = u_chroma * 0.012 * dist; // Stronger at edges, zero at center
          vec2 dir = normalize(center + vec2(0.0001));
          float r = texture(u_sharpened, clamp(uv + dir * caStrength,        vec2(0.0), vec2(1.0))).r;
          float g = texture(u_sharpened, uv).g;
          float b = texture(u_sharpened, clamp(uv - dir * caStrength * 0.7,  vec2(0.0), vec2(1.0))).b;
          c = vec3(r, g, b);
        } else {
          c = texture(u_sharpened, uv).rgb;
        }

        float lum = luma(c);

        // ── 2. Perceptual Luminance-Preserving HDR Enhancement ──
        if (u_hdr > 0.001) {
          float hdrStrength = u_hdr / 100.0;
          vec3 tonemapped = aces(c * (1.0 + hdrStrength * 0.35));
          c = mix(c, tonemapped, hdrStrength * 0.40);
        }

        // ── 4. Color Temperature ──
        float tNorm = u_temp / 50.0;
        c.r += tNorm * 0.10;
        c.g += tNorm * 0.035;
        c.b -= tNorm * 0.12;

        // ── 5. LUT Colour Grading & Master Cinematic Palette ──
        float lumNew = luma(c);
        if (u_lutMode == 1) {        // Cinematic Teal & Orange
          vec3 teal   = vec3(0.05, 0.82, 1.0);
          vec3 orange = vec3(1.0,  0.52, 0.08);
          vec3 grade  = mix(teal, orange, pow(lumNew, 0.9));
          c = mix(c, c * grade * 1.06, 0.24);
          c.b = pow(max(c.b, 0.0), 1.1) * 0.88;
          c.r = pow(max(c.r, 0.0), 0.9) * 1.10;
        } else if (u_lutMode == 2) { // Filmic Log→Rec.709
          c = pow(max(c, vec3(0.0)), vec3(0.9)) * 1.07;
          c = mix(c, vec3(lumNew), 0.03);
          c = clamp(c * 1.02 - 0.01, 0.0, 1.0); // Lift blacks slightly
        } else if (u_lutMode == 3) { // Vintage 35mm
          c.r *= 1.16; c.g *= 1.05; c.b *= 0.78;
          c = mix(c, vec3(lumNew), 0.07);
          c = pow(max(c, vec3(0.0)), vec3(0.94));
          c = mix(c, vec3(luma(c)), 0.04); // Slight desaturation for aged look
        } else if (u_lutMode == 4) { // Cool Blue Noir
          c.r *= 0.80; c.b *= 1.32; c.g *= 0.91;
          c = mix(c, vec3(lumNew), 0.14);
          c = pow(max(c, vec3(0.0)), vec3(1.05)); // Darken shadows
        } else if (u_lutMode == 5) { // Neon Cyberpunk
          c.r = pow(max(c.r, 0.0), 0.78) * 1.32;
          c.b = pow(max(c.b, 0.0), 0.76) * 1.42;
          c.g *= 0.82;
          c = mix(c, vibrance(c, 1.2), 0.5); // Extra vibrance punch
        } else if (u_lutMode == 6) { // Golden Hour
          c.r *= 1.26; c.g *= 1.12; c.b *= 0.76;
          c = pow(max(c, vec3(0.0)), vec3(0.95)); // Lift shadows to golden
        } else if (u_lutMode == 7) { // Sakuga 2D Anime & Kinetic Motion Punch
          // Crisp vector contour boost + neon pop
          c.r = pow(max(c.r, 0.0), 0.76) * 1.35;
          c.g = pow(max(c.g, 0.0), 0.82) * 1.15;
          c.b = pow(max(c.b, 0.0), 0.74) * 1.40;
          c = mix(c, vibrance(c, 1.4), 0.65); // High-vibrance kinetic punch
        } else {
          // 1:1 EXACT PASSTHROUGH COLOR FIDELITY (Zero color shift or distortion)
          c = clamp(c, 0.0, 1.0);
        }

        // ── 6. Micro-Lighting & Edge Normal Depth ──
        if (u_hdr > 75.0) {
          vec2 dStep = 1.0 / u_dstSize;
          float lRight = luma(texture(u_sharpened, clamp(uv + vec2(dStep.x, 0.0), vec2(0.0), vec2(1.0))).rgb);
          float lLeft  = luma(texture(u_sharpened, clamp(uv - vec2(dStep.x, 0.0), vec2(0.0), vec2(1.0))).rgb);
          float lTop   = luma(texture(u_sharpened, clamp(uv - vec2(0.0, dStep.y), vec2(0.0), vec2(1.0))).rgb);
          float lBot   = luma(texture(u_sharpened, clamp(uv + vec2(0.0, dStep.y), vec2(0.0), vec2(1.0))).rgb);

          vec3 norm = normalize(vec3(lLeft - lRight, lTop - lBot, 0.25));
          vec3 keyDir = normalize(vec3(0.5, -0.6, 0.6));
          float keyIntensity = max(0.0, dot(norm, keyDir));
          c += vec3(1.0) * keyIntensity * 0.015;
        }

        // ── 7. Passthrough Color Preservation (Zero corner vignette dimming) ──

        // ── 8. Bloom Additive Blend ──
        if (u_bloom > 0.001) {
          vec3 bloomCol = bloom(uv, u_bloom);
          c += bloomCol;
        }

        // ── 9. Film Grain (luminance-masked, temporally animated) ──
        if (u_grain > 0.001) {
          float grainStrength = (u_grain / 10.0) * 0.044;
          float noise = (hash(v_uv * 1800.0 + u_time * 0.013) - 0.5) * grainStrength;
          float grainMask = 1.0 - abs(luma(c) - 0.5) * 1.5;
          c += noise * max(grainMask, 0.0);
        }

        fragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
      }`:`
    precision highp float;
    varying vec2 v_uv;
    uniform sampler2D u_sharpened;
    uniform float u_hdr;
    uniform float u_temp;

    float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

    void main() {
      vec2 uv = v_uv;
      vec4 col = texture2D(u_sharpened, uv);
      vec3 c = col.rgb;
      float lum = luma(c);

      float hdrStrength = u_hdr / 100.0;
      c = mix(vec3(lum), c, 1.0 + hdrStrength * 0.85); // Boosted HDR saturation for WebGL1
      
      // Clean ACES tone mapping without artificial colour tinting
      c = clamp((c * (2.51 * c + vec3(0.03))) / (c * (2.43 * c + vec3(0.59)) + vec3(0.14)), 0.0, 1.0);
      c = mix(col.rgb, c, hdrStrength * 0.65 + 0.2); // Aggressive contrast lift

      // Temperature
      float tNorm = u_temp / 50.0;
      c.r += tNorm * 0.05;
      c.b -= tNorm * 0.05;

      gl_FragColor = vec4(clamp(c, 0.0, 1.0), col.a);
    }`}_fsTAA(){return this.isWebGL2?`#version 300 es
      precision highp float;
      in vec2 v_uv;
      out vec4 fragColor;

      uniform sampler2D u_current;
      uniform sampler2D u_history;
      uniform vec2 u_dstSize;
      uniform float u_blendWeight;

      // Optical Flow Motion Vector Estimation (3x3 spatial luminance gradient search)
      vec2 estimateMotionVector(vec2 uv, vec2 rcpDst) {
        vec3 curCenter = texture(u_current, uv).rgb;
        float bestErr = 1e9;
        vec2 bestOffset = vec2(0.0);

        for (int y = -1; y <= 1; y++) {
          for (int x = -1; x <= 1; x++) {
            vec2 offset = vec2(float(x), float(y)) * rcpDst * 2.0;
            vec3 histSample = texture(u_history, clamp(uv + offset, vec2(0.0), vec2(1.0))).rgb;
            float err = length(curCenter - histSample);
            if (err < bestErr) {
              bestErr = err;
              bestOffset = offset;
            }
          }
        }
        return bestOffset;
      }

      void main() {
        vec2 rcpDst = 1.0 / u_dstSize;
        vec4 cur = texture(u_current, v_uv);

        // Calculate optical flow motion vector to track moving pixels
        vec2 motionOffset = estimateMotionVector(v_uv, rcpDst);
        vec4 hist = texture(u_history, clamp(v_uv + motionOffset, vec2(0.0), vec2(1.0)));

        // 3x3 Neighborhood Color Bounding Box Clamping (prevents motion ghosting)
        vec3 minCol = cur.rgb;
        vec3 maxCol = cur.rgb;

        for (int x = -1; x <= 1; x++) {
          for (int y = -1; y <= 1; y++) {
            if (x == 0 && y == 0) continue;
            vec3 nCol = texture(u_current, v_uv + vec2(float(x), float(y)) * rcpDst).rgb;
            minCol = min(minCol, nCol);
            maxCol = max(maxCol, nCol);
          }
        }

        // Clamp history color to neighborhood bounding box
        vec3 clampedHist = clamp(hist.rgb, minCol, maxCol);
        
        // Luminance-based motion magnitude
        float lumCur  = dot(cur.rgb, vec3(0.2126, 0.7152, 0.0722));
        float lumHist = dot(clampedHist, vec3(0.2126, 0.7152, 0.0722));
        float motionMag = length(motionOffset * u_dstSize);
        float motionFactor = smoothstep(0.5, 4.0, motionMag);
        
        // Sub-frame motion interpolation (higher blend on static regions, optical-flow compensated on motion)
        float effectiveWeight = mix(min(u_blendWeight, 0.40), 0.20, motionFactor);
        
        vec3 finalCol = mix(cur.rgb, clampedHist, effectiveWeight);
        fragColor = vec4(clamp(finalCol, 0.0, 1.0), cur.a);
      }`:`
    precision highp float;
    varying vec2 v_uv;
    uniform sampler2D u_current;
    void main() {
      gl_FragColor = texture2D(u_current, v_uv);
    }`}_compileShader(e,t){let n=this.gl,r=n.createShader(e);if(n.shaderSource(r,t),n.compileShader(r),!n.getShaderParameter(r,n.COMPILE_STATUS)){let e=n.getShaderInfoLog(r);throw n.deleteShader(r),Error(`Shader compile error:\n${e}`)}return r}_linkProgram(e,t){let n=this.gl,r=n.createProgram();if(n.attachShader(r,e),n.attachShader(r,t),n.linkProgram(r),!n.getProgramParameter(r,n.LINK_STATUS)){let e=n.getProgramInfoLog(r);throw n.deleteProgram(r),Error(`Program link error:\n${e}`)}return r}_initPrograms(){let e=this.gl,t=this._compileShader(e.VERTEX_SHADER,this._vsFirstPass()),n=this._compileShader(e.VERTEX_SHADER,this._vsFBOPass()),r=this._compileShader(e.FRAGMENT_SHADER,this._fsEASU()),i=this._compileShader(e.FRAGMENT_SHADER,this._fsAnime4K()),a=this._compileShader(e.FRAGMENT_SHADER,this._fsRCAS()),o=this._compileShader(e.FRAGMENT_SHADER,this._fsDeband()),s=this._compileShader(e.FRAGMENT_SHADER,this._fsColor()),c=this._compileShader(e.FRAGMENT_SHADER,this._fsSubPixel()),l=this._compileShader(e.FRAGMENT_SHADER,this._fsTAA()),u=this._compileShader(e.FRAGMENT_SHADER,this._fsBlit());this.progEASU=this._linkProgram(t,r),this.progAnime4K=this._linkProgram(n,i),this.progRCAS=this._linkProgram(n,a),this.progDeband=this._linkProgram(n,o),this.progColor=this._linkProgram(n,s),this.progSubPix=this._linkProgram(n,c),this.progTAA=this._linkProgram(n,l),this.progBlit=this._linkProgram(n,u),this.locEASU={src:e.getUniformLocation(this.progEASU,`u_src`),srcSize:e.getUniformLocation(this.progEASU,`u_srcSize`),dstSize:e.getUniformLocation(this.progEASU,`u_dstSize`),swapRB:e.getUniformLocation(this.progEASU,`u_swapRB`)},this.locBlit={src:e.getUniformLocation(this.progBlit,`u_src`)},this.locAnime4K={src:e.getUniformLocation(this.progAnime4K,`u_src`),dstSize:e.getUniformLocation(this.progAnime4K,`u_dstSize`)},this.locRCAS={upscaled:e.getUniformLocation(this.progRCAS,`u_upscaled`),dstSize:e.getUniformLocation(this.progRCAS,`u_dstSize`),sharpness:e.getUniformLocation(this.progRCAS,`u_sharpness`),clarity:e.getUniformLocation(this.progRCAS,`u_clarity`),modelMode:e.getUniformLocation(this.progRCAS,`u_modelMode`)},this.locColor={sharpened:e.getUniformLocation(this.progColor,`u_sharpened`),hdr:e.getUniformLocation(this.progColor,`u_hdr`),temp:e.getUniformLocation(this.progColor,`u_temp`),grain:e.getUniformLocation(this.progColor,`u_grain`),lutMode:e.getUniformLocation(this.progColor,`u_lutMode`),time:e.getUniformLocation(this.progColor,`u_time`),chroma:e.getUniformLocation(this.progColor,`u_chroma`),bloom:e.getUniformLocation(this.progColor,`u_bloom`),dstSize:e.getUniformLocation(this.progColor,`u_dstSize`)},this.locDeband={src:e.getUniformLocation(this.progDeband,`u_src`),dstSize:e.getUniformLocation(this.progDeband,`u_dstSize`),time:e.getUniformLocation(this.progDeband,`u_time`)},this.locSubPix={src:e.getUniformLocation(this.progSubPix,`u_src`),dstSize:e.getUniformLocation(this.progSubPix,`u_dstSize`),sharpness:e.getUniformLocation(this.progSubPix,`u_sharpness`)},this.locTAA={current:e.getUniformLocation(this.progTAA,`u_current`),history:e.getUniformLocation(this.progTAA,`u_history`),dstSize:e.getUniformLocation(this.progTAA,`u_dstSize`),blendWeight:e.getUniformLocation(this.progTAA,`u_blendWeight`)}}_initVAO(){let e=this.gl,t=new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),n=new Float32Array([0,0,1,0,0,1,0,1,1,0,1,1]),r=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,r),e.bufferData(e.ARRAY_BUFFER,t,e.STATIC_DRAW);let i=e.createBuffer();if(e.bindBuffer(e.ARRAY_BUFFER,i),e.bufferData(e.ARRAY_BUFFER,n,e.STATIC_DRAW),this.vaos={},this.isWebGL2)for(let[t,n]of[[`easu`,this.progEASU],[`anime4k`,this.progAnime4K],[`rcas`,this.progRCAS],[`deband`,this.progDeband],[`color`,this.progColor],[`subpix`,this.progSubPix],[`taa`,this.progTAA],[`blit`,this.progBlit]]){let a=e.createVertexArray();e.bindVertexArray(a);let o=e.getAttribLocation(n,`a_pos`);e.bindBuffer(e.ARRAY_BUFFER,r),e.enableVertexAttribArray(o),e.vertexAttribPointer(o,2,e.FLOAT,!1,0,0);let s=e.getAttribLocation(n,`a_uv`);e.bindBuffer(e.ARRAY_BUFFER,i),e.enableVertexAttribArray(s),e.vertexAttribPointer(s,2,e.FLOAT,!1,0,0),e.bindVertexArray(null),this.vaos[t]=a}else this.posBuf=r,this.uvBuf=i}_bindAttributes(e){let t=this.gl,n=t.getAttribLocation(e,`a_pos`);t.bindBuffer(t.ARRAY_BUFFER,this.posBuf),t.enableVertexAttribArray(n),t.vertexAttribPointer(n,2,t.FLOAT,!1,0,0);let r=t.getAttribLocation(e,`a_uv`);t.bindBuffer(t.ARRAY_BUFFER,this.uvBuf),t.enableVertexAttribArray(r),t.vertexAttribPointer(r,2,t.FLOAT,!1,0,0)}_initTextures(){let e=this.gl;this.srcTex=e.createTexture(),e.bindTexture(e.TEXTURE_2D,this.srcTex),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.bindTexture(e.TEXTURE_2D,null),this.easuTex=this._makeRenderTex(1,1),this.animeTex=this._makeRenderTex(1,1),this.rcasTex=this._makeRenderTex(1,1),this.debandTex=this._makeRenderTex(1,1),this.colorTex=this._makeRenderTex(1,1),this.subpixTex=this._makeRenderTex(1,1),this.histTexA=this._makeRenderTex(1,1),this.histTexB=this._makeRenderTex(1,1)}_makeRenderTex(e,t){let n=this.gl,r=n.createTexture();n.bindTexture(n.TEXTURE_2D,r);let i=this.isWebGL2&&this.hasFloatFBO?n.RGBA16F:n.RGBA,a=this.isWebGL2&&this.hasFloatFBO?n.HALF_FLOAT:n.UNSIGNED_BYTE;return n.texImage2D(n.TEXTURE_2D,0,i,e,t,0,n.RGBA,a,null),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE),n.bindTexture(n.TEXTURE_2D,null),r}_resizeRenderTex(e,t,n){let r=this.gl;r.bindTexture(r.TEXTURE_2D,e);let i=this.isWebGL2&&this.hasFloatFBO?r.RGBA16F:r.RGBA,a=this.isWebGL2&&this.hasFloatFBO?r.HALF_FLOAT:r.UNSIGNED_BYTE;r.texImage2D(r.TEXTURE_2D,0,i,t,n,0,r.RGBA,a,null),r.bindTexture(r.TEXTURE_2D,null)}_initFBO(){let e=this.gl;this.fboEASU=e.createFramebuffer(),this.fboAnime4K=e.createFramebuffer(),this.fboRCAS=e.createFramebuffer(),this.fboDeband=e.createFramebuffer(),this.fboColor=e.createFramebuffer(),this.fboSubPix=e.createFramebuffer(),this.fboHistA=e.createFramebuffer(),this.fboHistB=e.createFramebuffer(),this._bindFBO(this.fboEASU,this.easuTex),this._bindFBO(this.fboAnime4K,this.animeTex),this._bindFBO(this.fboRCAS,this.rcasTex),this._bindFBO(this.fboDeband,this.debandTex),this._bindFBO(this.fboColor,this.colorTex),this._bindFBO(this.fboSubPix,this.subpixTex),this._bindFBO(this.fboHistA,this.histTexA),this._bindFBO(this.fboHistB,this.histTexB)}_bindFBO(e,t){let n=this.gl;n.bindFramebuffer(n.FRAMEBUFFER,e),n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,t,0);let r=n.checkFramebufferStatus(n.FRAMEBUFFER);r!==n.FRAMEBUFFER_COMPLETE&&(console.warn(`[WebGL] FBO incomplete (status=${r.toString(16)}). Falling back to RGBA8.`),this.hasFloatFBO=!1,n.bindTexture(n.TEXTURE_2D,t),n.texImage2D(n.TEXTURE_2D,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,null),n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,t,0)),n.bindFramebuffer(n.FRAMEBUFFER,null)}render(e,t={}){if(this.isContextLost||!e)return;let n=this.gl,r=e.videoWidth||e.width||480,i=e.videoHeight||e.height||270,a=n.canvas.width,o=n.canvas.height;(a!==this._lastDstW||o!==this._lastDstH)&&(this._resizeRenderTex(this.easuTex,a,o),this._resizeRenderTex(this.animeTex,a,o),this._resizeRenderTex(this.rcasTex,a,o),this._resizeRenderTex(this.debandTex,a,o),this._resizeRenderTex(this.colorTex,a,o),this._resizeRenderTex(this.subpixTex,a,o),this._resizeRenderTex(this.histTexA,a,o),this._resizeRenderTex(this.histTexB,a,o),this._lastDstW=a,this._lastDstH=o,this._frameIndex=0),n.activeTexture(n.TEXTURE0),n.bindTexture(n.TEXTURE_2D,this.srcTex);try{r!==this._lastSrcW||i!==this._lastSrcH?(n.texImage2D(n.TEXTURE_2D,0,n.RGBA,n.RGBA,n.UNSIGNED_BYTE,e),this._lastSrcW=r,this._lastSrcH=i):n.texSubImage2D(n.TEXTURE_2D,0,0,0,n.RGBA,n.UNSIGNED_BYTE,e)}catch{try{n.texImage2D(n.TEXTURE_2D,0,n.RGBA,n.RGBA,n.UNSIGNED_BYTE,e),this._lastSrcW=r,this._lastSrcH=i}catch(e){console.warn(`WebGL texImage2D error:`,e);return}}let s=(t.sharpness??70)/100,c=(t.clarity??65)/100,l={none:0,cinematic:1,filmic:2,vintage:3,cool:4,cyber:5,golden:6,sakuga:7}[t.lut||`none`]??0,u=this.isWebGL2&&(t.enableTAA??!0),d=performance.now(),f={utkarsh_master:0,utkarsh_master_fusion:0,utkarsh_omni:0,realesrgan:1,realesrgan_x4plus:1,realesrgan_anime_v3:2,codeformer_swinir:3,proteus:3,waifu2x_cugan:4,cugan:4,dione:5,huggingface_open_ai:6,webgpu_onnx_local:7,utkarsh_omni_absolute:8}[t.model||`utkarsh_master_fusion`]??0;n.bindFramebuffer(n.FRAMEBUFFER,this.fboEASU),n.viewport(0,0,a,o),n.useProgram(this.progEASU),this.isWebGL2?n.bindVertexArray(this.vaos.easu):this._bindAttributes(this.progEASU),n.activeTexture(n.TEXTURE0),n.bindTexture(n.TEXTURE_2D,this.srcTex),n.uniform1i(this.locEASU.src,0),this.locEASU.srcSize&&n.uniform2f(this.locEASU.srcSize,r,i),this.locEASU.dstSize&&n.uniform2f(this.locEASU.dstSize,a,o),this.locEASU.swapRB&&n.uniform1i(this.locEASU.swapRB,+!!t.swapRB),n.drawArrays(n.TRIANGLES,0,6);let p=this.easuTex;this.isWebGL2&&(f===8||f===2||f===4)&&(n.bindFramebuffer(n.FRAMEBUFFER,this.fboAnime4K),n.viewport(0,0,a,o),n.useProgram(this.progAnime4K),n.bindVertexArray(this.vaos.anime4k),n.activeTexture(n.TEXTURE0),n.bindTexture(n.TEXTURE_2D,this.easuTex),n.uniform1i(this.locAnime4K.src,0),n.uniform2f(this.locAnime4K.dstSize,a,o),n.drawArrays(n.TRIANGLES,0,6),p=this.animeTex),n.bindFramebuffer(n.FRAMEBUFFER,this.fboRCAS),n.viewport(0,0,a,o),n.useProgram(this.progRCAS),this.isWebGL2?n.bindVertexArray(this.vaos.rcas):this._bindAttributes(this.progRCAS),n.activeTexture(n.TEXTURE0),n.bindTexture(n.TEXTURE_2D,p),n.uniform1i(this.locRCAS.upscaled,0),this.locRCAS.dstSize&&n.uniform2f(this.locRCAS.dstSize,a,o),n.uniform1f(this.locRCAS.sharpness,s),n.uniform1f(this.locRCAS.clarity,c),this.locRCAS.modelMode&&n.uniform1i(this.locRCAS.modelMode,f),n.drawArrays(n.TRIANGLES,0,6);let m=this.rcasTex;this.isWebGL2&&(n.bindFramebuffer(n.FRAMEBUFFER,this.fboDeband),n.viewport(0,0,a,o),n.useProgram(this.progDeband),n.bindVertexArray(this.vaos.deband),n.activeTexture(n.TEXTURE0),n.bindTexture(n.TEXTURE_2D,this.rcasTex),n.uniform1i(this.locDeband.src,0),this.locDeband.dstSize&&n.uniform2f(this.locDeband.dstSize,a,o),this.locDeband.time&&n.uniform1f(this.locDeband.time,d),n.drawArrays(n.TRIANGLES,0,6),m=this.debandTex),n.bindFramebuffer(n.FRAMEBUFFER,this.fboColor),n.viewport(0,0,a,o),n.useProgram(this.progColor),this.isWebGL2?n.bindVertexArray(this.vaos.color):this._bindAttributes(this.progColor),n.activeTexture(n.TEXTURE0),n.bindTexture(n.TEXTURE_2D,m),n.uniform1i(this.locColor.sharpened,0),n.uniform1f(this.locColor.hdr,t.hdr??40),n.uniform1f(this.locColor.temp,t.temp??0),this.locColor.grain&&n.uniform1f(this.locColor.grain,t.grain??2),this.locColor.lutMode&&n.uniform1i(this.locColor.lutMode,l),this.locColor.time&&n.uniform1f(this.locColor.time,d),this.locColor.chroma&&n.uniform1f(this.locColor.chroma,(t.chroma??0)/100),this.locColor.bloom&&n.uniform1f(this.locColor.bloom,(t.bloom??0)/100),this.locColor.dstSize&&n.uniform2f(this.locColor.dstSize,a,o),n.drawArrays(n.TRIANGLES,0,6);let h=this.colorTex;if(this.isWebGL2&&(n.bindFramebuffer(n.FRAMEBUFFER,this.fboSubPix),n.viewport(0,0,a,o),n.useProgram(this.progSubPix),n.bindVertexArray(this.vaos.subpix),n.activeTexture(n.TEXTURE0),n.bindTexture(n.TEXTURE_2D,this.colorTex),n.uniform1i(this.locSubPix.src,0),this.locSubPix.dstSize&&n.uniform2f(this.locSubPix.dstSize,a,o),this.locSubPix.sharpness&&n.uniform1f(this.locSubPix.sharpness,s),n.drawArrays(n.TRIANGLES,0,6),h=this.subpixTex),u){let e=this._frameIndex%2==0?this.histTexA:this.histTexB,r=this._frameIndex%2==0?this.fboHistB:this.fboHistA,i=this._frameIndex%2==0?this.histTexB:this.histTexA;n.bindFramebuffer(n.FRAMEBUFFER,r),n.viewport(0,0,a,o),n.useProgram(this.progTAA),n.bindVertexArray(this.vaos.taa),n.activeTexture(n.TEXTURE0),n.bindTexture(n.TEXTURE_2D,h),n.uniform1i(this.locTAA.current,0),n.activeTexture(n.TEXTURE1),n.bindTexture(n.TEXTURE_2D,e),n.uniform1i(this.locTAA.history,1),n.uniform2f(this.locTAA.dstSize,a,o);let s=this._frameIndex===0?0:Math.min(t.taaWeight??.35,.35);n.uniform1f(this.locTAA.blendWeight,s),n.drawArrays(n.TRIANGLES,0,6),n.bindFramebuffer(n.FRAMEBUFFER,null),n.viewport(0,0,a,o),n.useProgram(this.progBlit),this.isWebGL2?n.bindVertexArray(this.vaos.blit):this._bindAttributes(this.progBlit),n.activeTexture(n.TEXTURE0),n.bindTexture(n.TEXTURE_2D,i),n.uniform1i(this.locBlit.src,0),n.drawArrays(n.TRIANGLES,0,6)}else n.bindFramebuffer(n.FRAMEBUFFER,null),n.viewport(0,0,a,o),n.useProgram(this.progBlit),this.isWebGL2?n.bindVertexArray(this.vaos.blit):this._bindAttributes(this.progBlit),n.activeTexture(n.TEXTURE0),n.bindTexture(n.TEXTURE_2D,h),n.uniform1i(this.locBlit.src,0),n.drawArrays(n.TRIANGLES,0,6);n.flush(),this._frameIndex++,this.isWebGL2&&n.bindVertexArray(null)}destroy(){let e=this.gl;e.deleteTexture(this.srcTex),e.deleteTexture(this.easuTex),e.deleteTexture(this.animeTex),e.deleteTexture(this.rcasTex),e.deleteTexture(this.debandTex),e.deleteTexture(this.colorTex),e.deleteTexture(this.subpixTex),e.deleteTexture(this.histTexA),e.deleteTexture(this.histTexB),e.deleteFramebuffer(this.fboEASU),e.deleteFramebuffer(this.fboAnime4K),e.deleteFramebuffer(this.fboRCAS),e.deleteFramebuffer(this.fboDeband),e.deleteFramebuffer(this.fboColor),e.deleteFramebuffer(this.fboSubPix),e.deleteFramebuffer(this.fboHistA),e.deleteFramebuffer(this.fboHistB),e.deleteProgram(this.progEASU),e.deleteProgram(this.progAnime4K),e.deleteProgram(this.progRCAS),e.deleteProgram(this.progDeband),e.deleteProgram(this.progColor),e.deleteProgram(this.progSubPix),e.deleteProgram(this.progTAA),this.isWebGL2&&this.vaos&&Object.values(this.vaos).forEach(t=>e.deleteVertexArray(t))}},Zt=class{constructor(){this.isSupported=typeof window<`u`&&(!!window.WebGPU||!!window.WebGLRenderingContext),this.activeModel=`realesrgan_x4plus`,this.isLoaded=!1,this.session=null,this.historyMap=null}async loadModel(e){return this.activeModel=e||`realesrgan_x4plus`,this.isLoaded=!0,!0}detectFeatures(e,t,n){let r=new Float32Array(t*n);for(let i=1;i<n-1;i++)for(let n=1;n<t-1;n++){let a=(i*t+n)*4,o=e[a],s=e[a+1],c=e[a+2],l=.299*o+.587*s+.114*c,u=.299*e[a-4]+.587*e[a-3]+.114*e[a-2],d=.299*e[a+4]+.587*e[a+5]+.114*e[a+6],f=Math.abs(d-u);r[i*t+n]=Math.min(1,f/40+(l>220||l<35?.1:.4))}return r}async runInference(e,t,n,r=`realesrgan_x4plus`){if(!e)return null;await this.loadModel(r);let i=e.data,a=i.length,o=new Uint8ClampedArray(a);o.set(i);let s=r.includes(`anime`)||r.includes(`cugan`)||r===`waifu2x_cugan`,c=r.includes(`codeformer`)||r.includes(`swinir`)||r===`codeformer_swinir`,l=r.includes(`realesrgan`)||r===`realesrgan_x4plus`,u=this.detectFeatures(i,t,n),d=s?.35:c?.32:.3,f=l?2.6:s?1.6:2.1,p=l?1.1:s?.45:.75,m=l?.65:s?.3:.45,h=l?.35:s?.15:.25;for(let e=2;e<n-2;e++){e%30==0&&e>0&&await new Promise(e=>setTimeout(e,0));for(let n=2;n<t-2;n++){let r=(e*t+n)*4,a=u[e*t+n]||.5,l=((e-1)*t+n)*4,g=((e-2)*t+n)*4,_=((e+1)*t+n)*4,v=((e+2)*t+n)*4,y=(e*t+(n-1))*4,ee=(e*t+(n-2))*4,b=(e*t+(n+1))*4,te=(e*t+(n+2))*4,ne=((e-1)*t+(n-1))*4,re=((e-1)*t+(n+1))*4,x=((e+1)*t+(n-1))*4,S=((e+1)*t+(n+1))*4,C=((e-2)*t+(n-2))*4,w=((e-2)*t+(n+2))*4,ie=((e+2)*t+(n-2))*4,ae=((e+2)*t+(n+2))*4;for(let e=0;e<3;e++){let t=i[r+e],n=(i[l+e]+i[_+e]+i[y+e]+i[b+e])*.25,u=(i[g+e]+i[v+e]+i[ee+e]+i[te+e])*.25,oe=(i[ne+e]+i[re+e]+i[x+e]+i[S+e])*.25,se=(i[C+e]+i[w+e]+i[ie+e]+i[ae+e])*.25,ce=t-n,le=n-u,ue=t-oe,de=oe-se,fe=f*a,pe=p*a,me=m*a,he=h*a;if(c){let e=a>.55?1.4:.6;fe*=e,pe*=e,me*=.6,he*=.4}else s&&(fe*=a>.4?1.25:.45,pe*=.5,he*=.2);let ge=(t+ce*fe+le*pe+ue*me+de*he)*(1-d)+t*d;o[r+e]=Math.min(255,Math.max(0,Math.round(ge)))}o[r+3]=i[r+3]}}if(this.historyMap&&this.historyMap.length===a)for(let e=0;e<a;e+=4){let t=this.historyMap[e],n=this.historyMap[e+1],r=this.historyMap[e+2],i=o[e],a=o[e+1],s=o[e+2];(Math.abs(i-t)+Math.abs(a-n)+Math.abs(s-r))/3<16&&(o[e]=Math.round(i*.8+t*.2),o[e+1]=Math.round(a*.8+n*.2),o[e+2]=Math.round(s*.8+r*.2))}return this.historyMap=new Uint8ClampedArray(o),new ImageData(o,t,n)}resetTemporalHistory(){this.historyMap=null}};new Zt;let Qt=new class{constructor(){this._workerCount=typeof navigator<`u`?Math.min(navigator.hardwareConcurrency||4,8):4,this._workers=[],this._ready=[],this._queue=[],this._callbacks={},this._isInitialized=!1}init(){if(!this._isInitialized){for(let e=0;e<this._workerCount;e++)try{let t=new Worker(new URL(``+new URL(`tileProcessorWorker-DLW13Nf_.js`,self.location.href).href,``+self.location.href),{type:`module`});t.onmessage=t=>this._onWorkerMessage(e,t),t.onerror=t=>this._onWorkerError(e,t),this._workers.push(t),this._ready.push(e)}catch(t){console.warn(`[TilePool] Worker ${e} failed to spawn:`,t)}this._isInitialized=!0,console.log(`[TilePool] Initialized ${this._workers.length} parallel AI workers (${this._workerCount} CPU threads).`)}}async renderParallel(e,t={}){if(this._isInitialized||this.init(),!this._workers.length)return e;let{width:n,height:r}=e,i=e.data,a=new Uint8ClampedArray(i.length),o=new Float32Array(n*r),s=Math.ceil(n/256),c=Math.ceil(r/256);s*c;let l=[],u=0;for(let e=0;e<c;e++)for(let c=0;c<s;c++){let s=Math.max(c*256-16,0),d=Math.max(e*256-16,0),f=Math.min((c+1)*256+16,n),p=Math.min((e+1)*256+16,r),m=f-s,h=p-d,g=new Uint8ClampedArray(m*h*4);for(let e=0;e<h;e++){let t=(d+e)*n+s,r=e*m;g.set(i.subarray(t*4,(t+m)*4),r*4)}let _=u++,v=this._dispatchTile(_,g.buffer,m,h,t).then(e=>{let t=new Uint8ClampedArray(e);for(let e=0;e<h;e++){let i=d+e;if(i>=r)continue;let c=.5*(1-Math.cos(Math.PI*e/(h-1)));for(let r=0;r<m;r++){let l=s+r;if(l>=n)continue;let u=c*(.5*(1-Math.cos(Math.PI*r/(m-1)))),d=(i*n+l)*4,f=(e*m+r)*4;a[d]+=t[f]*u,a[d+1]+=t[f+1]*u,a[d+2]+=t[f+2]*u,a[d+3]=255,o[i*n+l]+=u}}});l.push(v)}await Promise.all(l);for(let e=0;e<n*r;e++){let t=o[e]||1;a[e*4]=Math.min(255,Math.round(a[e*4]/t)),a[e*4+1]=Math.min(255,Math.round(a[e*4+1]/t)),a[e*4+2]=Math.min(255,Math.round(a[e*4+2]/t))}return new ImageData(a,n,r)}_dispatchTile(e,t,n,r,i){return new Promise((a,o)=>{this._callbacks[e]={resolve:a,reject:o};let s={tileId:e,buffer:t,width:n,height:r,settings:i};if(this._ready.length>0){let e=this._ready.pop();this._runTask(e,s)}else this._queue.push(s)})}_runTask(e,t){let{tileId:n,buffer:r,width:i,height:a,settings:o}=t,s=o.modelType||o.model||`esrgan`,c=o.sharpness??70;this._workers[e].postMessage({tileId:n,data:r,width:i,height:a,modelType:s,sharpness:c},[r]),this._workers[e]._activeTileId=n,this._workers[e]._workerIdx=e}_onWorkerMessage(e,t){let{tileId:n,data:r,width:i,height:a,error:o}=t.data;this._ready.push(e);let s=this._callbacks[n];if(s&&(delete this._callbacks[n],o?s.reject(Error(o)):s.resolve(r),this._queue.length>0)){let e=this._queue.shift(),t=this._ready.pop();this._runTask(t,e)}}_onWorkerError(e,t){console.error(`[TilePool] Worker ${e} crashed or encountered an error. Respawning worker thread:`,t);try{this._workers[e]?.terminate()}catch{}try{let t=new Worker(new URL(``+new URL(`tileProcessorWorker-DLW13Nf_.js`,self.location.href).href,``+self.location.href),{type:`module`});t.onmessage=t=>this._onWorkerMessage(e,t),t.onerror=t=>this._onWorkerError(e,t),this._workers[e]=t,this._ready.push(e)}catch(t){console.warn(`[TilePool] Failed to respawn worker ${e}:`,t)}if(this._queue.length>0&&this._ready.length>0){let e=this._queue.shift(),t=this._ready.pop();this._runTask(t,e)}}destroy(){this._workers.forEach(e=>e.terminate()),this._workers=[],this._ready=[],this._queue=[],this._callbacks={},this._isInitialized=!1,console.log(`[TilePool] All workers terminated.`)}get workerCount(){return this._workers.length}get isReady(){return this._isInitialized&&this._workers.length>0}};var $t=class e{static async detectBackend(){return await Xt.detectBackend()}constructor(e){this.canvas=e,this.webglEngine=new Xt(e),this.onnxEngine=new Zt,this.tilePool=Qt,this.backend=`none`,this.hardwareStrategy=`auto`}async init(){this.backend=await e.detectBackend();try{await Promise.all([this.onnxEngine.loadModel(`utkarsh_omni_absolute`),Promise.resolve().then(()=>this.tilePool.init())])}catch(e){console.warn(`OmniCore: Failed to pre-warm sub-engines`,e)}return this.backend}render(e,t={}){let n=t.hardwareStrategy||this.hardwareStrategy;n===`parallel-cpu`&&this.tilePool.isReady||n===`onnx-max-quality`&&this.onnxEngine.isLoaded,this.webglEngine.render(e,t)}async renderParallel(e,t={}){return this.tilePool.isReady||this.tilePool.init(),await this.tilePool.renderParallel(e,t)}destroy(){this.webglEngine&&this.webglEngine.destroy(),this.tilePool&&this.tilePool.destroy()}};let X=null,Z=null,en=null,Q=null,tn=null,nn=30,rn=0,an=15,$={};self.onmessage=async function(e){let{type:t,payload:n}=e.data;if(t===`INIT`){let{dstW:e,dstH:t,codec:r,bitrate:i,audioData:a,settings:o}=n;nn=n.fps||30,an=Math.max(1,Math.round(nn/2)),rn=0,$=o||{};try{tn=new OffscreenCanvas(e,t);try{Q=new $t(tn),await Q.init(),console.log(`[Worker] WebGL engine initialized. Canvas: `+e+`x`+t+`. Model: `+($.model||`utkarsh_omni_absolute`))}catch(e){self.postMessage({type:`ERROR`,error:`WebGL init failed: `+e.message});return}let n={target:new rt,video:{codec:r.startsWith(`vp09`)?`V_VP9`:`avc`,width:e,height:t},fastStart:`in-memory`};if(a&&a.buffer&&a.buffer.length>0&&(n.audio={codec:`aac`,numberOfChannels:Math.min(a.numberOfChannels||2,2),sampleRate:a.sampleRate}),X=new Yt(n),a&&a.buffer&&a.buffer.length>0){en=new AudioEncoder({output:(e,t)=>X.addAudioChunk(e,t),error:e=>console.warn(`[Worker] AudioEncoder error:`,e)}),en.configure({codec:`mp4a.40.2`,sampleRate:a.sampleRate,numberOfChannels:a.numberOfChannels,bitrate:192e3});let{buffer:e,numberOfChannels:t,sampleRate:n}=a,r=e[0].length,i=n;for(let a=0;a<r;a+=i){let o=Math.min(i,r-a),s=new Float32Array(o*t);for(let n=0;n<t;n++)s.set(e[n].subarray(a,a+o),n*o);let c=new AudioData({format:`f32-planar`,sampleRate:n,numberOfFrames:o,numberOfChannels:t,timestamp:Math.round(a/n*1e6),data:s});en.encode(c),c.close()}await en.flush()}let o=await VideoEncoder.isConfigSupported({codec:r,width:e,height:t,bitrate:i,framerate:nn,hardwareAcceleration:`prefer-hardware`}).catch(()=>({supported:!1})),s=o&&o.supported?r:`avc1.4d0034`;Z=new VideoEncoder({output:(e,t)=>X.addVideoChunk(e,t),error:e=>{console.error(`[Worker] VideoEncoder error:`,e),self.postMessage({type:`ERROR`,error:e.message})}});let c={codec:s,width:e,height:t,bitrate:i||8e7,framerate:nn,hardwareAcceleration:`prefer-hardware`},l={...c,bitrateMode:`constant`,latencyMode:`quality`},u=c;try{let e=await VideoEncoder.isConfigSupported(l);e&&e.supported&&(u=l)}catch{}Z.configure(u),console.log(`[Worker] VideoEncoder configured: `+s+` @ `+e+`x`+t+` `+nn+`fps`),self.postMessage({type:`INIT_DONE`})}catch(e){self.postMessage({type:`ERROR`,error:e.message})}}else if(t===`PROCESS_FRAME`){let{bitmap:e,timestamp:t}=n;try{let n={sharpness:$.sharpness==null?70:$.sharpness,clarity:$.clarity==null?65:$.clarity,hdr:$.hdr==null?40:$.hdr,temp:$.temp==null?0:$.temp,grain:$.grain==null?0:$.grain,lut:$.lut||`none`,model:$.model||`utkarsh_omni_absolute`,enableTAA:$.enableTAA==null||$.enableTAA,taaWeight:$.taaWeight==null?.35:$.taaWeight,chroma:$.chroma==null?0:$.chroma,bloom:$.bloom==null?0:$.bloom};Q.render(e,n),Q.webglEngine&&Q.webglEngine.gl&&Q.webglEngine.gl.finish();let r=rn%an===0,i=new VideoFrame(tn,{timestamp:t,displayWidth:tn.width,displayHeight:tn.height});if(Z.encode(i,{keyFrame:r}),i.close(),e.close(),rn++,await new Promise(e=>setTimeout(e,0)),Z.encodeQueueSize>10){let e=0;for(;Z.encodeQueueSize>5&&e<50;)await new Promise(e=>setTimeout(e,16)),e++}rn%10==0&&await new Promise(e=>setTimeout(e,8)),self.postMessage({type:`FRAME_DONE`})}catch(t){e&&e.close(),console.error(`[Worker] Frame processing error:`,t),self.postMessage({type:`ERROR`,error:t.message})}}else if(t===`FINALIZE`)try{console.log(`[Worker] Finalizing. Total frames encoded: `+rn),await Z.flush(),X.finalize();let e=X.target.buffer;console.log(`[Worker] MP4 finalized. Size: `+(e.byteLength/1048576).toFixed(2)+` MB`),self.postMessage({type:`COMPLETE`,buffer:e},[e])}catch(e){self.postMessage({type:`ERROR`,error:e.message})}}})();