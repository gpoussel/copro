// @ts-nocheck
[W,H]=readline().split(" ").map(eval)
T=readline().split(" "),B=[],p=0,Z=Math.round
for(i=0;i<T.length;i+=2)for(n=+T[i+1];n--;)B[p++]=T[i]<"C"
a=(x,y)=>B[y*W+x]
b=[],X=0
for(y=0;y<H;y++){s=0;for(x=0;x<W;x++)s+=a(x,y);if((b[y]=s)>X)X=s}
L=b.map(v=>v>X/2),C=[]
for(y=0;y<H;y++)if(L[y]){q=y;while(L[y])y++;C.push((q+y-1)/2)}
z=C.length,J=C[z-1],G=(J-C[0])/(z-1)
for(y=0;y<H;y++)if(!L[y])for(x=0;x<W;)if(a(x,y)){e=x;while(x<W&&a(x,y))x++;if(x-e>=G*1.25)while(e<x)B[y*W+e++]=2}else x++
k=(x,y)=>a(x,y)==1&&!L[y]
u=[],o=[]
for(x=0;x<W;x++){F=c=w=0;for(y=0;y<H;y++)if(a(x,y)==1){c++;if(c>F)F=c;if(!L[y])w++}else c=0;u[x]=F;o[x]=w}
Q=G*1.45
hd=(l,r)=>{
E=[],f=0
for(y=0;y<H;y++){A=D=-1;for(j=l;j<=r;j++)if(k(j,y)){if(A<0)A=j;D=j}if((E[y]=A<0?0:D-A+1)>f)f=E[y]}
t=h=-1;for(y=0;y<H;y++)if(E[y]>=f/2){if(t<0)t=y;h=y}
N=W,R=0
for(y=t;y<=h;y++)for(j=l;j<=r;j++)if(k(j,y)){if(j<N)N=j;if(j>R)R=j}
K=P=0,e=h-t,c=R-N,r0=Z(t+e*.3),r1=Z(t+e*.7),c0=Z(N+c*.35),c1=Z(N+c*.65)
for(y=r0;y<=r1;y++)if(!L[y])for(j=c0;j<=c1;j++)if(a(j,y)!=2){P++;K+=a(j,y)}
return "CDEFGAB"[(9+Z((J-(t+h)/2)/G*2))%7]+(K/P>.5?"Q":"H")
}
O=[]
for(x=0;x<W;)if(!o[x])x++;else{
x0=x;while(x<W&&o[x])x++;x1=x-1,S=[],j=x0
while(j<=x1)if(u[j]>=Q){V=j;while(j<=x1&&u[j]>=Q)j++;S.push((V+j-1)/2)}else j++
if((m=S.length)<2)O.push(hd(x0,x1))
else{d=[x0]
for(g=0;g<m-1;g++){I=S[g]+.5|0,U=1e9;for(j=I;j<=S[g+1];j++)if(o[j]<U){U=o[j];I=j}d.push(I)}
d.push(x1)
for(g=0;g<m;g++)O.push(hd(d[g],d[g+1]))}
}
console.log(O.join(" "))