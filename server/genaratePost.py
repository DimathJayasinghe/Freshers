#!/usr/bin/env python3
import sys
import json

def genarate_post(data: dict) -> str:
    # Basic post generator. Customize as needed.
    sport = data.get('sport', 'Sport')
    gender = data.get('gender', '')
    positions = data.get('positions', [])

    header = f"{sport} {gender} Results" if gender else f"{sport} Results"
    lines = [header, '']

    if positions:
        for p in positions[:3]:
            place = p.get('place')
            faculty = p.get('faculty')
            lines.append(f"{place}. {faculty}")
    else:
        lines.append('Results available — see full standings for details.')

    lines.append('')
    lines.append('See full results: (link)')

    return '\n'.join(lines)


def main():
    try:
        raw = sys.stdin.read()
        payload = json.loads(raw or '{}')
        post = genarate_post(payload)
        # Print the post as plain text
        print(post)
    except Exception as e:
        print(f'Error generating post: {e}', file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
