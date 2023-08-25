
how to change run sudo with out password by chage sudoer file question thread

https://askubuntu.com/questions/155791/how-do-i-sudo-a-command-in-a-script-without-being-asked-for-a-password/155827#155827

==================

1. chage sudoer to file to be able to run "sudo xpeed-db" without password

	- open terminal
	- $sudo visudo 
	- below the line 
		%sudo   ALL=(ALL:ALL) ALL

	- insert 
		username ALL=(ALL) NOPASSWD: /usr/local/bin/gaimon

	EG.
		%sudo ALL=(ALL:ALL) ALL
		root ALL=(ALL) NOPASSWD: /usr/local/bin/gaimon
		root ALL=(ALL) NOPASSWD: /usr/bin/gaimon

2. copy file "xpeed" to /etc/init.d
	- open new terminal
	- $sudo cp ./gaimon-deamon /etc/init.d/gaimon-deamon

3. apply change and enable daemon
	- $sudo update-rc.d gaimon-deamon defaults

4. test service
	- $sudo service gaimon-deamon restart
	- $sudo tmux ls      ----> *** tmux must be use "sudo" as service start as root 
	- if Gaimon tmux session exist
	- $sudo tmux a -t Gaimon

5. remove service
	- $sudo update-rc.d -f gaimon-deamon remove
	- $sudo rm -rfv /etc/init.d/gaimon-deamon
