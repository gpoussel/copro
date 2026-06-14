var [W,H]=readline().split(" ").map(eval)
var T=readline().split(" "),B=new Uint8Array(W*H),p=0,x,y,s,M=Math,Z=M.round
for(var i=0;i<T.length;i+=2)for(var n=+T[i+1];n--;)B[p++]=+(T[i]<"C")
var a=(x,y)=>B[y*W+x]
var rb=[],mx=0
for(y=0;y<H;y++){s=0;for(x=0;x<W;x++)s+=a(x,y);if((rb[y]=s)>mx)mx=s}
var L=rb.map(v=>v>mx/2),C=[]
for(y=0;y<H;y++)if(L[y]){var q=y;while(L[y])y++;C.push((q+y-1)/2)}
var z=C.length,bE=C[z-1],gp=(bE-C[0])/(z-1)
for(y=0;y<H;y++)if(!L[y])for(x=0;x<W;)if(a(x,y)){var e=x;while(x<W&&a(x,y))x++;if(x-e>=gp*1.25)while(e<x)B[y*W+e++]=2}else x++
var ink=(x,y)=>a(x,y)==1&&!L[y]
var vr=[],co=[]
for(x=0;x<W;x++){var bs=0,cu=0,sm=0;for(y=0;y<H;y++)if(a(x,y)==1){cu++;if(cu>bs)bs=cu;if(!L[y])sm++}else cu=0;vr[x]=bs;co[x]=sm}
var ST=gp*1.45
var hd=(l,r)=>{
var E=[],me=0,y,xx
for(y=0;y<H;y++){var A=-1,D=-1;for(xx=l;xx<=r;xx++)if(ink(xx,y)){if(A<0)A=xx;D=xx}if((E[y]=A<0?0:D-A+1)>me)me=E[y]}
var ht=-1,hb=-1;for(y=0;y<H;y++)if(E[y]>=me/2){if(ht<0)ht=y;hb=y}
var cy=(ht+hb)/2,hl=W,hr=0
for(y=ht;y<=hb;y++)for(xx=l;xx<=r;xx++)if(ink(xx,y)){if(xx<hl)hl=xx;if(xx>hr)hr=xx}
var bk=0,tt=0,r0=Z(ht+(hb-ht)*.3),r1=Z(ht+(hb-ht)*.7),c0=Z(hl+(hr-hl)*.35),c1=Z(hl+(hr-hl)*.65)
for(y=r0;y<=r1;y++)if(!L[y])for(xx=c0;xx<=c1;xx++)if(a(xx,y)!=2){tt++;bk+=a(xx,y)}
return "CDEFGAB"[(9+Z((bE-cy)/gp*2))%7]+(bk/tt>.5?"Q":"H")
}
var O=[]
for(x=0;x<W;){
if(!co[x]){x++;continue}
var x0=x;while(x<W&&co[x])x++;var x1=x-1,sc=[],xx=x0
while(xx<=x1)if(vr[xx]>=ST){var a3=xx;while(xx<=x1&&vr[xx]>=ST)xx++;sc.push((a3+xx-1)/2)}else xx++
if(sc.length<2)O.push(hd(x0,x1))
else{var bd=[x0]
for(var k=0;k<sc.length-1;k++){var bx=M.ceil(sc[k]),bv=1e9;for(xx=bx;xx<=sc[k+1];xx++)if(co[xx]<bv){bv=co[xx];bx=xx}bd.push(bx)}
bd.push(x1)
for(k=0;k<sc.length;k++)O.push(hd(bd[k],bd[k+1]))}
}
console.log(O.join(" "))