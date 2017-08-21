# README

To make this web functional, the following requirements must be fulfilled beforehand:
* Having Hyperkit and the LXD Web Scheduler in the same directory
* Having correct database table structure "Ip_Adresses" with id, machine, ip, currently_used, created_at, and updated_at columns
* Making sure that the LXD Cloud Scheduler is functional
* One functional machine in LXD with registered ip in database
* SQL dump?

After making sure that everything is fulfilled, you can simply start the rails server and go to localhost.

Upon entering the web, you will be asked to choose the default machine. Choose one from the database that has the same IP as your machine's IP.

#Fucntionality

This website heavily use Hyperkit as wrapper to connect to the LXD API, and has implemented some of the commands from Hyperkit. Some example of these features are:
* List all container in a machine.
* Add container, given there's already an image in the machine.
* Start and stop the container, as well as restarting running ones.
* See the details of container, including IP adresses, image info, and architecture.
* Change machines at will.
* Add new IP address for a different machine.
* Use console to execute command in bash (on progress)