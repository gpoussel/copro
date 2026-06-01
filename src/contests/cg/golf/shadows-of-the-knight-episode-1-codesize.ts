var R=()=>readline().split(" ").map(a=>+a),[r,d]=R(),[X,Y]=(R(),R()),l=0,u=0,s
for(--r,--d;s=readline();)console.log((s>"T"?d=Y-1:s<"E"&&(u=Y+1),/R/.test(s)?l=X+1:/L/.test(s)&&(r=X-1),X=l+r>>1),Y=u+d>>1)
