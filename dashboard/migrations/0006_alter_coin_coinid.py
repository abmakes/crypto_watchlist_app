# Generated by Django 3.2.6 on 2022-02-23 05:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0005_coin_image'),
    ]

    operations = [
        migrations.AlterField(
            model_name='coin',
            name='coinId',
            field=models.CharField(max_length=16, unique=True),
        ),
    ]
