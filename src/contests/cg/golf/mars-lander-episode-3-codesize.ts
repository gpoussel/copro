// @ts-nocheck
var M=Math,N=parseInt(readline()),xs=[],ys=[],i,c,r,t,k
for(i=0;i<N;i++){var p=readline().split(' ');xs.push(parseInt(p[0]));ys.push(parseInt(p[1]))}
var xL=0,xR=0,pY=0
for(i=0;i<N-1;i++)if(ys[i]===ys[i+1]){xL=xs[i];xR=xs[i+1];pY=ys[i]}
if(xL>xR){var tm=xL;xL=xR;xR=tm}
var tx=(xL+xR)/2,G=3.711,px=[],py=[]
for(i=0;i<N;i++){px.push(xs[i]);py.push(ys[i])}
px.push(6999);py.push(0);px.push(0);py.push(0)
function sd(x,y){if(y<=0)return 1;var I=0,n=px.length,j=n-1;for(k=0;k<n;k++){var yi=py[k],yj=py[j],xi=px[k],xj=px[j];if(yi>y!==yj>y){var xt=xi+(xj-xi)*(y-yi)/(yj-yi);if(x<xt)I=!I}j=k}return I}
var CS=50,GW=M.ceil(7000/CS),GH=M.ceil(3000/CS),sg=[],clr=[]
for(c=0;c<GW;c++){sg[c]=[];for(r=0;r<GH;r++)sg[c][r]=sd(c*CS+CS/2,r*CS+CS/2)}
for(c=0;c<GW;c++){clr[c]=[];for(r=0;r<GH;r++)clr[c][r]=sg[c][r]?0:1e9}
var bq=[]
for(c=0;c<GW;c++)for(r=0;r<GH;r++)if(sg[c][r])bq.push([c,r])
var bh=0,d4=[[1,0],[-1,0],[0,1],[0,-1]]
while(bh<bq.length){var cc=bq[bh][0],cr=bq[bh][1];bh++;for(t=0;t<4;t++){var nc=cc+d4[t][0],nr=cr+d4[t][1];if(nc<0||nr<0||nc>=GW||nr>=GH)continue;if(clr[nc][nr]>clr[cc][cr]+1){clr[nc][nr]=clr[cc][cr]+1;bq.push([nc,nr])}}}
var MN=2,fr=[]
for(c=0;c<GW;c++){fr[c]=[];for(r=0;r<GH;r++)fr[c][r]=!sg[c][r]&&clr[c][r]>=MN}
var pC=M.floor(tx/CS),pR=M.floor((pY+CS)/CS)
while(pR<GH&&!fr[pC][pR])pR++
var MC=1
for(c=0;c<GW;c++)for(r=0;r<GH;r++)if(fr[c][r]&&clr[c][r]<1e8&&clr[c][r]>MC)MC=clr[c][r]
var D=[]
for(c=0;c<GW;c++){D[c]=[];for(r=0;r<GH;r++)D[c][r]=Infinity}
D[pC][pR]=0
var pq=[[0,pC,pR]],d8=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]
while(pq.length){var bi=0;for(i=1;i<pq.length;i++)if(pq[i][0]<pq[bi][0])bi=i;var tp=pq.splice(bi,1)[0],cd=tp[0],cx=tp[1],cy=tp[2];if(cd>D[cx][cy])continue;for(t=0;t<8;t++){var nc=cx+d8[t][0],nr=cy+d8[t][1];if(nc<0||nr<0||nc>=GW||nr>=GH)continue;if(!fr[nc][nr])continue;var dg=d8[t][0]&&d8[t][1]?1.4142:1,pe=(MC-M.min(clr[nc][nr],MC))*0.6,nco=cd+dg+pe;if(nco<D[nc][nr]){D[nc][nr]=nco;pq.push([nco,nc,nr])}}}
function cO(x,y){var c=M.floor(x/CS),r=M.floor(y/CS);if(c<0)c=0;if(c>=GW)c=GW-1;if(r<0)r=0;if(r>=GH)r=GH-1;if(!isFinite(D[c][r])){var be=1e9,fc=c,f2=r;for(var dc=-10;dc<=10;dc++)for(var dr=-10;dr<=10;dr++){var nc=c+dc,nr=r+dr;if(nc<0||nr<0||nc>=GW||nr>=GH)continue;if(!isFinite(D[nc][nr]))continue;var dd=dc*dc+dr*dr;if(dd<be){be=dd;fc=nc;f2=nr}}c=fc;r=f2}return[c,r]}
function pa(x,y,st){var ce=cO(x,y),c=ce[0],r=ce[1],ou=[[c,r]];for(var s=0;s<st;s++){if(D[c][r]<=0)break;var be=D[c][r],bc=c,br=r;for(t=0;t<8;t++){var nc=c+d8[t][0],nr=r+d8[t][1];if(nc<0||nr<0||nc>=GW||nr>=GH)continue;if(!isFinite(D[nc][nr]))continue;if(D[nc][nr]<be){be=D[nc][nr];bc=nc;br=nr}}if(bc===c&&br===r)break;c=bc;r=br;ou.push([c,r])}return ou}
function mT(a,b){if(a>b){var t=a;a=b;b=t}var m=0;for(var x=a;x<=b;x+=50){var s=0;for(var y=0;y<3000;y+=20)if(!sd(x,y)){s=y;break}if(s>m)m=s}return m}
function cl(v,lo,hi){return v<lo?lo:v>hi?hi:v}
while(true){var ln=readline().split(' '),X=parseInt(ln[0]),Y=parseInt(ln[1]),hS=parseInt(ln[2]),vS=parseInt(ln[3]),oP=X>xL+5&&X<xR-5,cD=oP
if(oP)for(var yy=pY+20;yy<Y;yy+=25)if(sd(X,yy)){cD=false;break}
var ax=0,au=0
if(oP&&cD){ax=M.abs(hS)>15?cl((0-hS)*0.5,-2,2):0;var h=Y-pY,al=M.sqrt(2*0.27*M.max(0,h-30))+5,tv=-M.min(38,al);au=cl((tv-vS)*0.8+G,0.3,5)}else{var ce=pa(X,Y,5),la=ce[ce.length-1],gx=la[0]*CS+CS/2,gy=la[1]*CS+CS/2,dx=gx-X,dy=gy-Y,cu=cO(X,Y),cc=clr[cu[0]][cu[1]]*CS,SC=cl(cc*0.12,14,40),hA=Y-pY;if(hA<700)SC=M.min(SC,cl(hA*0.035+12,12,40));var ds=M.max(1,M.hypot(dx,dy)),dVx=dx/ds*SC,dVy=dy/ds*SC,di=gx>=X?1:-1,mt=mT(X,X+di*700)+90,bk=M.sqrt(2*0.27*M.max(0,Y-mt))+5;if(dVy<-bk)dVy=-bk;if(Y<mt)dVy=M.max(dVy,18);ax=cl((dVx-hS)*0.6,-4,4);au=cl((dVy-vS)*0.7+G,0.3,5)}
var pw=cl(M.round(M.hypot(ax,au)),1,4),an=cl(M.round(M.atan2(-ax,au)*180/M.PI),-90,90)
if(oP&&cD&&Y-pY<60)an=0
console.log(an+' '+pw)}
