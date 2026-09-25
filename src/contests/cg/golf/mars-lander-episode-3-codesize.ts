eval(`R=readline;P=[[0,3e3],...[...Array(+R())].map(_=>R().split(" ").map(Number)),[6999,3e3]]
P.map((p,i)=>i&&p[1]==P[i-1][1]&&(L=P[i-1][0],M=p[0],F=p[1]))
O=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
S=(a,b)=>!P.some((c,i,_,d=P[i-1])=>i&&O(a,b,c)*O(a,b,d)<=0&&O(c,d,a)*O(c,d,b)<=0)
H=([a,b],[c,d])=>Math.hypot(a-c,b-d)
Z=([a,b],[c,d],w=60,x=c-a,y=d-b,l=Math.hypot(x,y))=>[0,w,-w].every(k=>S([a-y*(k/=l),b+x*k],[c-y*k,d+x*k]))
C=(v,a,b)=>v<a?a:v>b?b:v
with(Math){Q=[[(L+M)/2,F+200]]
P.map((b,i)=>(a=P[i-1])&&(c=P[i+1])&&Q.push([b[0]+(a[1]-c[1])*(g=200/H(a,c)),b[1]+(c[0]-a[0])*g]))
D=Q.map((_,i)=>i?1e9:0)
for(k of Q)for(i in Q)for(j in Q)(t=D[j]+H(Q[i],Q[j]))<D[i]&&Z(Q[i],Q[j])&&(D[i]=t)
for(;;){[x,y,h,v]=p=R().split(" ").map(Number);z=y-F
if(f=x>L+20&&x<M-20&&(z<30||S(p,[x,F+1])))a=C(-h*.3,-1.5,1.5),u=C((-min(30,sqrt(.5*max(0,z-20))+4)-v)*1.2+3.711,0,4)
else{m=1e9;T=[x,y+99];for(i in Q)(t=H(p,Q[i])+D[i])<m&&Z(p,Q[i])&&(m=t,T=Q[i])
X=T[0]-x;Y=T[1]-y;s=hypot(X,Y)+1;e=min(40,sqrt(2.4*s)+5);c=X/s*e;d=max(Y/s*e,-sqrt(.5*max(0,-Y))-3)
S(p,[x+h*12,y])&&Z(p,[x+h*6,y+v*6],30)||(c=0,d=max(v,0))
u=C((d-v)*.7+3.711,0,4);e=max(.5,sqrt(16-u*u));a=C((c-h)*.5,-e,e)}
print(f&&z<3*abs(v)+40?0:round(atan2(-a,u)*57.3),min(4,round(hypot(a,u))))}}`)