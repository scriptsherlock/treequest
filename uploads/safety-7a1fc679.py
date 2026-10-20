# name, weight kg, length m, height m, safe?
A=[("rooster",3,0.5,0.7,1),("cat",4,0.5,0.3,1),("rabbit",2,0.4,0.25,1),
   ("Great Dane",70,1.3,0.85,1),("penguin",25,1.1,1.1,1),("goat",60,1.3,0.9,1),
   ("border collie",20,1.0,0.55,1),
   ("python",30,4.0,0.2,1),("monitor lizard",20,2.0,0.3,1),("kangaroo",85,1.6,1.6,1),
   ("alligator",100,3.0,0.4,0),
   ("pig",250,1.4,0.9,1),("black bear",200,1.4,0.9,1),("gorilla",180,1.4,1.5,1),
   ("elephant",4000,6.0,3.0,1),("horse",500,2.4,1.6,1),
   ("skunk",4,0.6,0.3,0),("porcupine",12,0.8,0.3,0)]
def fits(a): return a[1]<=150 and a[2]<=1.5 and a[4]==1
F={"heavy":lambda a:a[1]>150,"long":lambda a:a[2]>1.5,
   "tall":lambda a:a[3]>1.0,"unsafe":lambda a:a[4]==0}
def odd(p):
    if not p: return 0
    f=sum(fits(x) for x in p); return min(f,len(p)-f)
def sc(pool,k):
    y=[a for a in pool if F[k](a)]; n=[a for a in pool if not F[k](a)]
    return odd(y)+odd(n),abs(len(y)-len(n)),y,n
def grow(pool,used,d=0,br=""):
    if odd(pool)==0:
        print("  "*d+br+("FITS" if fits(pool[0]) else "NO")+f" ({len(pool)})");return
    rows=sorted((sc(pool,k)[0],sc(pool,k)[1],k) for k in F if k not in used
                and sc(pool,k)[2] and sc(pool,k)[3])
    if d==0: print("ROOT SCORES:",[(r[2],r[0]) for r in rows])
    e,b,k=rows[0]; print("  "*d+br+k+f" (err {e})")
    _,_,y,n=sc(pool,k); grow(y,used+[k],d+1,"yes-> "); grow(n,used+[k],d+1,"no -> ")
grow(A,[])
