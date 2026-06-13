var RL=readline,P=s=>s.split(" "),[W,H]=P(RL()).map(Number),G=[]
for(var i=0;i<H;i++)G.push(P(RL()).map(Number))
var E=+RL(),TB="010123010123000130013011000101201021100010",gp=t=>t<2?[t]:t<4?[2,3]:t<6?[4,5]:t<10?[6,7,8,9]:[10,11,12,13],PL=[],F=(x,y,e,u,p)=>{
if(y>=H)return x==E
if(x<0||x>=W||p>W*H*2)return 0
var c=O[y][x],k=G[y][x]<0||!p||x==E&&y==H-1,a=gp(c),o,q,r,d
for(o of k?[c]:a){
q=(o-c+4)%4;r=q<3?q:1;if(u+r>p)continue
d=+TB[e*14+o];if(d<1)continue
PL.push([x,y,e,c,o])
if(F(x+(d>1?d*2-5:0),y+(d<2?1:0),d<2?0:d<3?2:1,u+r,p+1))return 1
PL.pop()}
return 0}
var O=G.map(r=>r.map(v=>v<0?-v:v)),Y,S,X,J,RK,A,DF=null,Q=(x,y,e)=>{var d=+TB[e*14+O[y][x]];return d==1?[x,y+1,0]:d==2?[x-1,y,2]:d==3?[x+1,y,1]:0},TJ=(x,y,e)=>{var t=[[x,y,e]],n,i;for(i=0;i<W*H+9;i++){n=Q(x,y,e);if(!n)break;x=n[0];y=n[1];e=n[2];if(x<0||x>=W||y<0||y>=H)break;t.push([x,y,e])}return t},Z=(x,y,R)=>{var g=gp(O[y][x]),L=g.length;O[y][x]=g[(O[y][x]-g[0]+(R?1:L-1))%L];return x+" "+y+" "+(R?"RIGHT":"LEFT")},U=(x,y,t)=>{var c=O[y][x],g=gp(c),L=g.length,q=(t-c+L)%L;return Z(x,y,q<=L-q?1:0)},K=(x,y)=>RK.some(r=>r[0]==x&&r[1]==y),D=()=>{var s=S[0];if(s&&!K(s[0],s[1])&&!(s[0]==X&&s[1]==J)){A=Z(s[0],s[1],s[2]);S.shift()}}
for(;;){
var l=P(RL());X=+l[0];J=+l[1];var pi="TLR".indexOf(l[2][0])
var nr=+RL();RK=[]
for(var k=nr;k--;){var r=P(RL());RK.push([+r[0],+r[1],"TLR".indexOf(r[2][0])])}
PL=[];F(X,J,pi,0,0);Y=[];S=[]
PL.forEach((p,di)=>{Y.push([p[0],p[1],p[2]]);var ct=p[3],tg=p[4]
while(ct!=tg){var g=gp(ct),L=g.length,d=(tg-ct+L)%L,R=d*2<=L
S.push([p[0],p[1],R?1:0,di]);ct=g[(ct-g[0]+(R?1:L-1))%L]}})
A="WAIT"
var free=S.every((s,j)=>s[3]>=j+2),done=0
if(S.length&&!free){D();done=+(A!="WAIT")}
if(!done&&DF){
if(O[DF[1]][DF[0]]==DF[2])DF=null
else if(!K(DF[0],DF[1])&&!(DF[0]==X&&DF[1]==J)){var z=Y.find(c=>c[0]==DF[0]&&c[1]==DF[1]);if(!z||+TB[z[2]*14+DF[2]]){A=U(DF[0],DF[1],DF[2]);done=1}else DF=null}}
if(!done&&!DF){
var bk=999,bc=null
for(var r of RK){
var tr=TJ(r[0],r[1],r[2])
var kc=0
for(var k=1;k<tr.length;k++){var ip=Y[k];if(!ip)break
if(tr[k][0]==ip[0]&&tr[k][1]==ip[1]){kc=k;break}
var pp=Y[k-1];if(pp&&tr[k][0]==pp[0]&&tr[k][1]==pp[1]&&tr[k-1][0]==ip[0]&&tr[k-1][1]==ip[1]){kc=k;break}}
if(!kc||kc>=bk)continue
for(var m=1;m<kc;m++){var cx=tr[m][0],cy=tr[m][1],ce=tr[m][2]
if(G[cy][cx]<0||cx==X&&cy==J||cx==E&&cy==H-1||K(cx,cy))continue
var g=gp(O[cy][cx]),L=g.length;if(L<2)continue
if(Y.some(c=>c[0]==cx&&c[1]==cy))continue
var bd=9,bt=-1
for(var tt of g)if(+TB[ce*14+tt]==0){var qq=(tt-O[cy][cx]+L)%L,st=qq<L-qq?qq:L-qq;if(st<bd){bd=st;bt=tt}}
if(bt<0||bd>m-S.filter(s=>s[3]<=m).length)continue
bc=[cx,cy,bt];bk=kc;break}}
if(bc){DF=bc;if(!K(DF[0],DF[1])){A=U(DF[0],DF[1],DF[2]);done=1}}}
if(!done&&!DF&&!S.length){
for(var r of RK){
var tr=TJ(r[0],r[1],r[2])
for(var k=1;k<tr.length;k++){var ip=Y[k];if(!ip)break
if(tr[k][0]==ip[0]&&tr[k][1]==ip[1]){
var cx=tr[k][0],cy=tr[k][1],ce=tr[k][2],g=gp(O[cy][cx]),L=g.length,np=Y[k+1],bd=9,bt=-1
if(G[cy][cx]<0||cx==X&&cy==J||cx==E&&cy==H-1||K(cx,cy))break
for(var tt of g){var id=+TB[Y[k][2]*14+tt];if(+TB[ce*14+tt]==0&&id&&(!np||id==1&&np[0]==cx&&np[1]==cy+1||id==2&&np[0]==cx-1&&np[1]==cy||id==3&&np[0]==cx+1&&np[1]==cy)){var qq=(tt-O[cy][cx]+L)%L,st=qq<L-qq?qq:L-qq;if(st<bd){bd=st;bt=tt}}}
if(bt>=0){DF=[cx,cy,bt];A=U(cx,cy,bt);done=1}break}}}}
if(!done)D()
var a=P(A),nn=Y[1];if(a[2]&&nn&&+a[0]==nn[0]&&+a[1]==nn[1]&&!+TB[nn[2]*14+O[+a[1]][+a[0]]]){Z(+a[0],+a[1],a[2]=="LEFT");A="WAIT"}
console.log(A)}