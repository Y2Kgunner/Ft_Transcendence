# Generated by Django 4.2.1 on 2024-04-21 15:18

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user_auth', '0002_webuser_deleted_at_webuser_is_deleted'),
    ]

    operations = [
        migrations.AddField(
            model_name='webuser',
            name='pong_games_played',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='webuser',
            name='pong_losses',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='webuser',
            name='pong_scored',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='webuser',
            name='pong_wins',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='webuser',
            name='ttt_draws',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='webuser',
            name='ttt_games_played',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='webuser',
            name='ttt_losses',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='webuser',
            name='ttt_wins',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='webuser',
            name='phone_number',
            field=models.CharField(blank=True, max_length=17, null=True, validators=[django.core.validators.RegexValidator(message="Phone number must be entered in the format: '+971-XX-XXX-XXXX'.", regex='^\\+?1?\\d{9,15}$')], verbose_name='phone number'),
        ),
    ]
