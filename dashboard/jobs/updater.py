from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from .jobs import fetch_schedule, fetch_coinlist

def startJob():
    scheduler = BackgroundScheduler()
    scheduler.add_job(fetch_schedule, 'interval', minutes=10)
    # scheduler.add_job(fetch_coinlist, 'interval', minutes=1)

    try:
      scheduler.start()
    except KeyboardInterrupt:
      scheduler.shutdown()
    # print(scheduler.get_jobs())