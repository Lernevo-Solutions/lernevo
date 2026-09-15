from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [('app', '0003_invitation')]

    operations = [
        migrations.CreateModel(
            name='JobCode',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(max_length=50, unique=True)),
                ('title', models.CharField(max_length=255)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('organization', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='job_codes', to='app.organization')),
            ],
        ),
        migrations.CreateModel(
            name='UserAssignment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start_date', models.DateField()),
                ('end_date', models.DateField(blank=True, null=True)),
                ('status', models.CharField(choices=[('ACTIVE', 'Active'), ('PENDING', 'Pending'), ('INACTIVE', 'Inactive')], default='ACTIVE', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('job_code', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='assignments', to='app.jobcode')),
                ('organization', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='assignments', to='app.organization')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='assignments', to='app.user')),
            ],
        ),
    ]
