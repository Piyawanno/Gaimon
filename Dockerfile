FROM ubuntu:20.04
RUN apt-get update
RUN apt-get install -y python3 python3-pip libmariadb-dev libpq-dev nano
COPY dist/xerial-0.9-py3-none-any.whl /root
COPY dist/gaimon-0.1-py3-none-any.whl /root
RUN pip3 install /root/xerial-0.9-py3-none-any.whl
RUN pip3 install /root/gaimon-0.1-py3-none-any.whl
RUN gaimon-init --no-config
COPY docker-production/* /etc/gaimon/
ENTRYPOINT ["gaimon"]