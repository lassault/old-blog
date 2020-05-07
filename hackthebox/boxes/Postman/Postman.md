Postman
===
![Postman](https://lassa97.github.io/imgs/Postman.png)

---
### Nmap
We start with an `nmap` scan:

> lassault@kakia:~$ nmap -sV -sC -oA Postman 10.10.10.160

```
# Nmap 7.80 scan initiated Wed Feb  5 11:28:24 2019 as: nmap -sC -sV -oA postman 10.10.10.160
Nmap scan report for 10.10.10.160
Host is up (0.049s latency).
Not shown: 997 closed ports
PORT      STATE SERVICE VERSION
22/tcp    open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   2048 46:83:4f:f1:38:61:c0:1c:74:cb:b5:d1:4a:68:4d:77 (RSA)
|   256 2d:8d:27:d2:df:15:1a:31:53:05:fb:ff:f0:62:26:89 (ECDSA)
|_  256 ca:7c:82:aa:5a:d3:72:ca:8b:8a:38:3a:80:41:a0:45 (ED25519)
80/tcp    open  http    Apache httpd 2.4.29 ((Ubuntu))
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: The Cyber Geek's Personal Website
10000/tcp open  http    MiniServ 1.910 (Webmin httpd)
|_http-server-header: MiniServ/1.910
|_http-title: Site doesn't have a title (text/html; Charset=iso-8859-1).
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Wed Feb  5 11:29:14 2019 -- 1 IP address (1 host up) scanned in 50.51 seconds
```

We find `ssh` on port 22, `http` on port 80 and `Webmin` on port 10000.

---

### Web Enumeration
We use `gobuster` to find some useful directories that we can exploit:

> lassault@kakia:~$ gobuster dir -u http://10.10.10.160 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -o Postman.dir

```
===============================================================
[+] Url:            http://10.10.10.160
[+] Threads:        10
[+] Wordlist:       /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
[+] Status codes:   200,204,301,302,307,401,403
[+] User Agent:     gobuster/3.0.1
[+] Timeout:        10s
===============================================================
2020/02/05 11:34:51 Starting gobuster
===============================================================
/css (Status: 301)
/fonts (Status: 301)
/images (Status: 301)
/js (Status: 301)
/server-status (Status: 403)
/upload (Status: 301)
===============================================================
2020/01/08 11:53:18 Finished
===============================================================
```
We explore the webpage, but we don't find any way to gain access to the server. Because of that, we decide to rerun `nmap` using a full scan:

> lassault@kakia:~$ nmap -p- -oA Postman 10.10.10.160

```
# Nmap 7.80 scan initiated Wed Feb  5 12:03:12 2019 as: nmap -sC -sV -oA postman 10.10.10.160
Nmap scan report for 10.10.10.160
Host is up (0.049s latency).
Not shown: 997 closed ports
PORT      STATE SERVICE VERSION
22/tcp    open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   2048 46:83:4f:f1:38:61:c0:1c:74:cb:b5:d1:4a:68:4d:77 (RSA)
|   256 2d:8d:27:d2:df:15:1a:31:53:05:fb:ff:f0:62:26:89 (ECDSA)
|_  256 ca:7c:82:aa:5a:d3:72:ca:8b:8a:38:3a:80:41:a0:45 (ED25519)
80/tcp    open  http    Apache httpd 2.4.29 ((Ubuntu))
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: The Cyber Geek's Personal Website
6379/tcp  open  redis   Redis key-value store 4.0.9
10000/tcp open  http    MiniServ 1.910 (Webmin httpd)
|_http-server-header: MiniServ/1.910
|_http-title: Site doesn't have a title (text/html; Charset=iso-8859-1).
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Wed Feb  5 12:04:26 2019 -- 1 IP address (1 host up) scanned in 74.32 seconds
```

We find `Redis` on port 6379. Doing some research, we find there is a Remote Command Execution vulnerability (http://antirez.com/news/96)

We follow the previous source to add our own `ssh` key to the `authorized_keys` of the user `redis`. Now, we are able to login as `redis`.

> lassault@kakia:~$ ssh redis@10.10.10.160

---

### Redis

Once we are logged, we do some enumeration and we find an `ssh` key in */opt/id_rsa.key* with a passphrase. We bruteforce using __ssh2john.py__ and __John The Ripper__.

> lassault@kakia:~$ ssh2john.py Matt.key > Matt.John
>
> lassault@kakia:~$ john --wordlist=/usr/share/wordlists/rockyou.txt --format=SSH Matt.John

We obtain this creds *Matt:computer2008*. We can't login via `ssh`, but we can log to the `Webmin` panel with that creds.

### Root
We use the Webmin Package Updates Remote Command Execution vulnerability (CVE-2019-12840) to obtain *root* access. We can use the Metasploit module of Webmin 1.910 (exploit/linux/http/webmin_packageup_rce) to obtain a reverse shell. We should put the SSL option to true, because the Webmin panel is in https://10.10.10.160:10000
With the *root* shell, we can see the user flag and the root flag.

> root@postman:~# cat /home/Matt/user.txt

`HTB{517ad0ec2458ca97af8d93aac08a2f3c}`

> root@postman:~# cat root/root.txt

`HTB{a257741c5bed8be7778c6ed95686ddce}`
