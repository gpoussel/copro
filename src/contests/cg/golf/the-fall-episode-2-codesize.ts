var RL=readline,P=s=>s.split(" "),[W,H]=P(RL()).map(Number),G=[]
for(var i=0;i<H;i++)G.push(P(RL()).map(Number))
var EX=+RL(),TB="010123010123000130013011000101201021100010"
var gp=t=>t<2?[t]:t<4?[2,3]:t<6?[4,5]:t<10?[6,7,8,9]:[10,11,12,13]
var PL=[]
var dfs=(x,y,e,u,dep)=>{
if(y>=H)return x==EX
if(x<0||x>=W||dep>W*H*2)return 0
var ct=G[y][x],lk=ct<0||!dep||x==EX&&y==H-1,g=gp(ct=ct<0?-ct:ct)
for(var o of lk?[ct]:g){
var q=(o-ct+4)%4,c=q<3?q:1;if(u+c>dep)continue
var d=+TB[e*14+o];if(d<1)continue
var nx=x,ny=y,ne=0
d==1?ny++:d==2?(nx--,ne=2):(nx++,ne=1)
PL.push([x,y,e,ct,o])
if(dfs(nx,ny,ne,u+c,dep+1))return 1
PL.pop()}
return 0}
var O=G.map(r=>r.map(v=>v<0?-v:v)),PATH=[],S=[],T=0,init=0,xi,yi,RK,act,DF=null
var stp=(x,y,e)=>{var d=+TB[e*14+O[y][x]];return d==1?[x,y+1,0]:d==2?[x-1,y,2]:d==3?[x+1,y,1]:0}
var rotR=(x,y,R)=>{var g=gp(O[y][x]),L=g.length;O[y][x]=g[(O[y][x]-g[0]+(R?1:L-1))%L];return x+" "+y+" "+(R?"RIGHT":"LEFT")}
var stepTo=(x,y,t)=>{var c=O[y][x],g=gp(c),L=g.length,q=(t-c+L)%L;return rotR(x,y,q<=L-q?1:0)}
var rockAt=(x,y)=>RK.some(r=>r[0]==x&&r[1]==y)
var doP=()=>{var s=S[0];if(s&&!rockAt(s[0],s[1])&&!(s[0]==xi&&s[1]==yi)){act=rotR(s[0],s[1],s[2]);S.shift()}}
for(;;){
var l=P(RL());xi=+l[0];yi=+l[1];var pi="TLR".indexOf(l[2][0])
var nr=+RL();RK=[]
for(var k=nr;k--;){var r=P(RL());RK.push([+r[0],+r[1],"TLR".indexOf(r[2][0])])}
if(!init){init=1
dfs(xi,yi,pi,0,0)
for(var p of PL){PATH.push([p[0],p[1],p[2]]);var ct=p[3],tg=p[4]
while(ct!=tg){var g=gp(ct),L=g.length,d=(tg-ct+L)%L,R=d*2<=L
S.push([p[0],p[1],R?1:0,PATH.length-1]);ct=g[(ct-g[0]+(R?1:L-1))%L]}}}
act="WAIT"
var free=S.every((s,j)=>s[3]>=T+j+2),done=0
if(S.length&&!free){doP();done=+(act!="WAIT")}
if(!done&&DF){
if(O[DF[1]][DF[0]]==DF[2])DF=null
else if(!rockAt(DF[0],DF[1])&&!(DF[0]==xi&&DF[1]==yi)){var z=PATH.slice(T).find(c=>c[0]==DF[0]&&c[1]==DF[1]);if(!z||+TB[z[2]*14+DF[2]]){act=stepTo(DF[0],DF[1],DF[2]);done=1}else DF=null}}
if(!done&&!DF){
var bk=1e9,bc=null
for(var r of RK){
var rx=r[0],ry=r[1],re=r[2],tr=[[rx,ry,re]]
for(var i=0;i<W*H+9;i++){var n=stp(rx,ry,re);if(!n)break;rx=n[0];ry=n[1];re=n[2];if(rx<0||rx>=W||ry<0||ry>=H)break;tr.push([rx,ry,re])}
var kc=0
for(var k=1;k<tr.length;k++){var ip=PATH[T+k];if(!ip)break
if(tr[k][0]==ip[0]&&tr[k][1]==ip[1]){kc=k;break}
var pp=PATH[T+k-1];if(pp&&tr[k][0]==pp[0]&&tr[k][1]==pp[1]&&tr[k-1][0]==ip[0]&&tr[k-1][1]==ip[1]){kc=k;break}}
if(!kc||kc>=bk)continue
for(var m=1;m<kc;m++){var cx=tr[m][0],cy=tr[m][1],ce=tr[m][2]
if(G[cy][cx]<0||cx==xi&&cy==yi||cx==EX&&cy==H-1||rockAt(cx,cy))continue
var g=gp(O[cy][cx]),L=g.length;if(L<2)continue
if(PATH.slice(T).some(c=>c[0]==cx&&c[1]==cy))continue
var bd=1e9,bt=-1
for(var tt of g)if(+TB[ce*14+tt]==0){var qq=(tt-O[cy][cx]+L)%L,st=qq<L-qq?qq:L-qq;if(st<bd){bd=st;bt=tt}}
if(bt<0||bd>m-S.filter(s=>s[3]<=T+m).length)continue
bc=[cx,cy,bt];bk=kc;break}}
if(bc){DF=bc;if(!rockAt(DF[0],DF[1])){act=stepTo(DF[0],DF[1],DF[2]);done=1}}}
if(!done&&!DF&&!S.length){
for(var r of RK){
var rx=r[0],ry=r[1],re=r[2],tr=[[rx,ry,re]]
for(var i=0;i<W*H+9;i++){var n=stp(rx,ry,re);if(!n)break;rx=n[0];ry=n[1];re=n[2];if(rx<0||rx>=W||ry<0||ry>=H)break;tr.push([rx,ry,re])}
for(var k=1;k<tr.length;k++){var ip=PATH[T+k];if(!ip)break
if(tr[k][0]==ip[0]&&tr[k][1]==ip[1]){
var cx=tr[k][0],cy=tr[k][1],ce=tr[k][2],g=gp(O[cy][cx]),L=g.length,ii=T+k,np=PATH[ii+1],bd=1e9,bt=-1
if(G[cy][cx]<0||cx==xi&&cy==yi||cx==EX&&cy==H-1||rockAt(cx,cy))break
for(var tt of g){var id=+TB[PATH[ii][2]*14+tt];if(+TB[ce*14+tt]==0&&id&&(!np||id==1&&np[0]==cx&&np[1]==cy+1||id==2&&np[0]==cx-1&&np[1]==cy||id==3&&np[0]==cx+1&&np[1]==cy)){var qq=(tt-O[cy][cx]+L)%L,st=qq<L-qq?qq:L-qq;if(st<bd){bd=st;bt=tt}}}
if(bt>=0){var zz=PATH.slice(T).find(c=>c[0]==cx&&c[1]==cy);if(!zz||+TB[zz[2]*14+bt]){DF=[cx,cy,bt];act=stepTo(cx,cy,bt);done=1}}break}}}}
if(!done)doP()
var a=P(act),nn=PATH[T+1];if(a[2]&&nn&&+a[0]==nn[0]&&+a[1]==nn[1]&&!+TB[nn[2]*14+O[+a[1]][+a[0]]]){rotR(+a[0],+a[1],a[2]=="LEFT");act="WAIT"}
console.log(act)
T++}
