// @ts-nocheck
var fl=readline().split(" "),W=parseInt(fl[0]),H=parseInt(fl[1]),M=Math,wa=[];
for(var y=0;y<H;y++){var r=[];for(var x=0;x<W;x++)r.push(false);wa.push(r)}
var wk=false,nd=[],turn=0,bo=[],pl={},pm=false;
function inB(x,y){return x>=0&&x<W&&y>=0&&y<H}
function ss(s){if(s.vx===0&&s.vy===0)return;var nx=s.x+s.vx,ny=s.y+s.vy;if(!inB(nx,ny)||wa[ny][nx]){s.vx=-s.vx;s.vy=-s.vy;nx=s.x+s.vx;ny=s.y+s.vy;if(!inB(nx,ny)||wa[ny][nx])return}s.x=nx;s.y=ny}
function bl(bx,by){var c=[by*W+bx],d=[[1,0],[-1,0],[0,1],[0,-1]];for(var i=0;i<4;i++)for(var r=1;r<=3;r++){var cx=bx+d[i][0]*r,cy=by+d[i][1]*r;if(!inB(cx,cy))break;if(wa[cy][cx])break;c.push(cy*W+cx)}return c}
function pc(v){v=v-((v>>1)&0x55555555);v=(v&0x33333333)+((v>>2)&0x33333333);v=(v+(v>>4))&0x0f0f0f0f;return(v*0x01010101)>>24}
while(true){
var line=readline(),pp=line.split(" "),rl=parseInt(pp[0]),bL=parseInt(pp[1]),gr=[];
for(var y=0;y<H;y++)gr.push(readline());
if(!wk){for(var y=0;y<H;y++)for(var x=0;x<W;x++)if(gr[y][x]==="#")wa[y][x]=true;wk=true}
var cu=[];
for(var y=0;y<H;y++)for(var x=0;x<W;x++)if(gr[y][x]==="@")cu.push({x:x,y:y});
bo=bo.filter(b=>b.et>turn);
if(turn===0){nd=[];for(var i=0;i<cu.length;i++)nd.push({x:cu[i].x,y:cu[i].y,vx:0,vy:0,known:false,hasV:false,stays:0,alive:true})}else{
var us=[];for(var i=0;i<cu.length;i++)us.push(false);
var an=nd.filter(n=>n.alive),ac={};
for(var ci=0;ci<cu.length;ci++)ac[cu[ci].y*W+cu[ci].x]=true;
var ma=[];for(var ni=0;ni<an.length;ni++)ma.push(false);
for(var ni=0;ni<an.length;ni++){var n=an[ni];if(!n.hasV)continue;var s0={x:n.x,y:n.y,vx:n.vx,vy:n.vy};ss(s0);if(ac[s0.y*W+s0.x]){n.x=s0.x;n.y=s0.y;n.vx=s0.vx;n.vy=s0.vy;n.known=true;ma[ni]=true}else{n.alive=false}}
var ex={};
for(var ni=0;ni<an.length;ni++)if(ma[ni])ex[an[ni].y*W+an[ni].x]=true;
for(var ci=0;ci<cu.length;ci++)if(ex[cu[ci].y*W+cu[ci].x])us[ci]=true;
var pa=[];
for(var ni=0;ni<an.length;ni++){if(ma[ni]||an[ni].hasV)continue;var n=an[ni];for(var ci=0;ci<cu.length;ci++){if(us[ci])continue;var di=M.abs(cu[ci].x-n.x)+M.abs(cu[ci].y-n.y);if(di<=1)pa.push([di,ni,ci])}}
pa.sort((a,b)=>a[0]-b[0]);
for(var p2=0;p2<pa.length;p2++){var pr=pa[p2],ni2=pr[1],ci2=pr[2];if(ma[ni2]||us[ci2])continue;us[ci2]=true;ma[ni2]=true;var n2=an[ni2];n2.vx=cu[ci2].x-n2.x;n2.vy=cu[ci2].y-n2.y;n2.hasV=true;n2.known=false;n2.x=cu[ci2].x;n2.y=cu[ci2].y}
for(var ni=0;ni<an.length;ni++)if(!ma[ni])an[ni].alive=false;
for(var ci=0;ci<cu.length;ci++)if(!us[ci]){nd.push({x:cu[ci].x,y:cu[ci].y,vx:0,vy:0,known:false,hasV:false,stays:0,alive:true});us[ci]=true}
}
var al=nd.filter(n=>n.alive),action="WAIT",ak=true;
for(var i=0;i<al.length;i++)if(!al[i].known)ak=false;
var bn=false;
if(pm&&pl[turn]!==undefined){var pcN=pl[turn];if(gr[(pcN-(pcN%W))/W][pcN%W]!==".")bn=true}
var np=al.length>0&&bL>0&&ak&&(!pm||bn);
if(np){
pm=true;
var t0=Date.now(),lt=turn+rl-1,mp=lt-3,LK=al.length>15?42:60;
if(mp>turn+LK)mp=turn+LK;
if(mp<turn)mp=turn;
var mk=mp+3-turn,N=al.length,tr=[];
for(var i=0;i<N;i++){var s={x:al[i].x,y:al[i].y,vx:al[i].vx,vy:al[i].vy},arr=[s.y*W+s.x];for(var k=1;k<=mk;k++){ss(s);arr.push(s.y*W+s.x)}tr.push(arr)}
var dm=0;
for(var bi=0;bi<bo.length;bi++){var b=bo[bi],k=b.et-turn;if(k<0)k=0;if(k>mk)continue;var cl=bl(b.x,b.y);for(var i=0;i<N;i++){var pc0=tr[i][k];for(var c=0;c<cl.length;c++)if(cl[c]===pc0){dm|=(1<<i);break}}}
var FU=((N>=31?-1:(1<<N)-1))&~dm,PT=[];
for(var pt=turn;pt<=mp;pt++)PT.push(pt);
var P=PT.length,kk={};
for(var pi=0;pi<P;pi++){var kk0=PT[pi]+3-turn;if(kk[kk0])continue;var tab=[];for(var c2=0;c2<W*H;c2++)tab.push(0);for(var yy=0;yy<H;yy++)for(var xx=0;xx<W;xx++){if(wa[yy][xx])continue;var cl2=bl(xx,yy),m=0;for(var i=0;i<N;i++){var pc3=tr[i][kk0];for(var c=0;c<cl2.length;c++)if(cl2[c]===pc3){m|=(1<<i);break}}tab[yy*W+xx]=m}kk[kk0]=tab}
function mA(pt,cell){return kk[pt+3-turn][cell]}
var cb={};
for(var pi=0;pi<P;pi++){var pt=PT[pi],kp=pt-turn,oc={};for(var i=0;i<N;i++)oc[tr[i][kp]]=true;var tb=kk[pt+3-turn],ls=[];for(var ci=0;ci<W*H;ci++)if(tb[ci]!==0&&!oc[ci])ls.push(ci);cb[pt]=ls}
function gd(){var rem=FU,up={},sol=[];for(var b2=0;b2<bL;b2++){if(rem===0)break;var mx=0,bp=-1,bc=-1;for(var p3=0;p3<P;p3++){var ptx=PT[p3];if(up[ptx])continue;var tb=kk[ptx+3-turn],l2=cb[ptx];for(var li=0;li<l2.length;li++){var cell=l2[li],sc=pc(tb[cell]&rem);if(sc>mx){mx=sc;bp=ptx;bc=cell}}}if(mx===0)break;up[bp]=true;sol.push({pt:bp,cell:bc});rem&=~mA(bp,bc)}return sol}
function cv(sol){var m=0;for(var i=0;i<sol.length;i++)m|=mA(sol[i].pt,sol[i].cell);return pc(m&FU)}
var sf=[];
for(var i=0;i<N;i++)sf.push([]);
for(var pi=0;pi<P;pi++){var ptz=PT[pi],tbz=kk[ptz+3-turn],lz=cb[ptz];for(var li=0;li<lz.length;li++){var cz=lz[li],mz=tbz[cz];for(var i=0;i<N;i++)if(mz&(1<<i))sf[i].push([ptz,cz])}}
var bs=gd(),bc2=cv(bs),tg=pc(FU);
function cM(sol){var m=0;for(var i=0;i<sol.length;i++)m|=mA(sol[i].pt,sol[i].cell);return m&FU}
if(bc2<tg){
var cs=[];
for(var i=0;i<bs.length;i++)cs.push({pt:bs[i].pt,cell:bs[i].cell});
while(cs.length<bL){var rp=PT[(M.random()*P)|0],l3=cb[rp];if(l3.length===0)continue;cs.push({pt:rp,cell:l3[(M.random()*l3.length)|0]})}
var cc=pc(cM(cs));
if(cc>bc2){bc2=cc;bs=cs.map(s=>({pt:s.pt,cell:s.cell}))}
var ct=0;
while(bc2<tg){
ct++;
if((ct&255)===0&&Date.now()-t0>=85)break;
var cm=cM(cs),un=FU&~cm,oP=-1,oC=-1,ix=-1;
if(un!==0&&M.random()<0.8){
var uo=[];for(var i=0;i<N;i++)if(un&(1<<i))uo.push(i);
var node=uo[(M.random()*uo.length)|0],sh=sf[node];
if(sh.length===0){continue}
var shot=sh[(M.random()*sh.length)|0],sp=shot[0],sc=shot[1];
ix=(M.random()*cs.length)|0;
var cla=false;for(var j=0;j<cs.length;j++)if(j!==ix&&cs[j].pt===sp){cla=true;break}
if(cla)continue;
oP=cs[ix].pt;oC=cs[ix].cell;cs[ix].pt=sp;cs[ix].cell=sc;
}else{
ix=(M.random()*cs.length)|0;oP=cs[ix].pt;oC=cs[ix].cell;
if(M.random()<0.5){var npt=PT[(M.random()*P)|0],cl2=false;for(var j=0;j<cs.length;j++)if(j!==ix&&cs[j].pt===npt){cl2=true;break}if(!cl2)cs[ix].pt=npt}
var l4=cb[cs[ix].pt];
if(l4.length===0){cs[ix].pt=oP;cs[ix].cell=oC;continue}
cs[ix].cell=l4[(M.random()*l4.length)|0];
}
var co=pc(cM(cs));
if(co>=cc||M.random()<0.1){cc=co;if(co>bc2){bc2=co;bs=cs.map(s=>({pt:s.pt,cell:s.cell}))}}else{cs[ix].pt=oP;cs[ix].cell=oC}
}
}
pl={};
for(var i=0;i<bs.length;i++)pl[bs[i].pt]=bs[i].cell;
if(bc2<tg&&rl>6){pm=false;pl={}}
}
if(bL>0&&pl[turn]!==undefined){var nc=pl[turn],ax=nc%W,ay=(nc-(nc%W))/W;if(gr[ay][ax]==="."){action=ax+" "+ay;bo.push({x:ax,y:ay,et:turn+3})}else{action="WAIT"}}
console.log(action);
turn++;
}
