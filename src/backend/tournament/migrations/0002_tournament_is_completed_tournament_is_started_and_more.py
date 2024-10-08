# Generated by Django 4.2.1 on 2024-02-17 20:23

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('tournament', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='tournament',
            name='is_completed',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='tournament',
            name='is_started',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='tournament',
            name='winner',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='won_tournaments', to=settings.AUTH_USER_MODEL),
        ),
        migrations.CreateModel(
            name='Match',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('match_order', models.IntegerField(default=0)),
                ('result', models.CharField(blank=True, max_length=255, null=True)),
                ('is_completed', models.BooleanField(default=False)),
                ('round_number', models.IntegerField(default=1)),
                ('loser', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='matches_lost', to='tournament.participant')),
                ('participant_one', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='matches_as_participant_one', to='tournament.participant')),
                ('participant_two', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='matches_as_participant_two', to='tournament.participant')),
                ('tournament', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='matches', to='tournament.tournament')),
                ('winner', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='matches_won', to='tournament.participant')),
            ],
            options={
                'ordering': ['match_order'],
            },
        ),
    ]
