import 'package:collection/collection.dart';
import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:timezone/timezone.dart' as tz;

class HomePage extends HookWidget {
  const HomePage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final locationState = useState(tz.local);
    final targetState = useState(DateTime.now().add(const Duration(days: 1)));

    final durationToTarget = targetState.value.difference(DateTime.now());

    final zones = tz.timeZoneDatabase.locations.entries
        .map(
          (e) {
            return e.value.zones;
          },
        )
        .flattened
        .toSet();

    print("locations: ${tz.timeZoneDatabase.locations.length}");
    print("zones: ${zones.length}");
    // final test = tz.timeZoneDatabase;
    // tz.UTC.currentTimeZone;
    // tz.getLocation('America/Detroit').currentTimeZone;
    // tz.timeZoneDatabase.locations;
    // TimeZone.UTC

    return Scaffold(
      appBar: AppBar(
        title: const Text('Countdown'),
      ),
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
        child: Column(
          children: [
            const Text(
              "Enter the date and time that you want to count down to:",
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            Text(targetState.value.toString()),
            Text(targetState.value.timeZoneName),
            Text(locationState.value.currentTimeZone.abbreviation),
            const SizedBox(height: 24),
            Text(durationToTarget.toString()),
          ],
        ),
      ),
    );
  }
}
