#!/usr/bin/env python3
"""
Extract the daily readings from the USCCB liturgical calendar PDFs.

    python scripts/usccb-extract.py <pdf-dir> <out.json>

The USCCB publishes a liturgical calendar for each calendar year as a PDF.
Each day is laid out like this:

    1 SUN SECOND SUNDAY OF LENT violet
    Gn 12:1-4a/2 Tm 1:8b-10/Mt 17:1-9 (25)   Pss II

    3 Tue Lenten Weekday violet
    [USA: Saint Katharine Drexel, Virgin]
    Is 1:10, 16-20/Mt 23:1-12 (231)

So the readings are the citations separated by slashes: First Reading, then
Second Reading, then Gospel — two of them on a weekday, three on a Sunday,
with the responsorial psalm after the lectionary number.

The same PDF also states the cycles in force, which is how the year is
labelled:

    Sunday Cycle YEAR A November 30, 2025 to November 22, 2026
    Weekday Cycle CYCLE 2

The output is JSON. `generate-readings.ts` turns it into content files using
the calendar engine, so the slots and the readings cannot disagree.
"""

import json
import os
import re
import sys

BOOKS = {
    "Gn": "Genesis", "Ex": "Exodus", "Lv": "Leviticus", "Nm": "Numbers",
    "Dt": "Deuteronomy", "Jos": "Joshua", "Jgs": "Judges", "Ru": "Ruth",
    "Rt": "Ruth", "1 Sm": "1 Samuel", "2 Sm": "2 Samuel", "1 Kgs": "1 Kings",
    "2 Kgs": "2 Kings", "1 Chr": "1 Chronicles", "2 Chr": "2 Chronicles",
    "Ezr": "Ezra", "Neh": "Nehemiah", "Tb": "Tobit", "Tob": "Tobit",
    "Jdt": "Judith", "Est": "Esther", "1 Mc": "1 Maccabees",
    "2 Mc": "2 Maccabees", "1 Mac": "1 Maccabees", "2 Mac": "2 Maccabees",
    "Jb": "Job", "Job": "Job", "Ps": "Psalm", "Pss": "Psalm",
    "Prv": "Proverbs", "Eccl": "Ecclesiastes", "Wis": "Wisdom",
    "Ws": "Wisdom", "Sir": "Sirach", "Sg": "Song of Songs",
    "Is": "Isaiah", "Jer": "Jeremiah", "Lam": "Lamentations",
    "Bar": "Baruch", "Ezk": "Ezekiel", "Ezek": "Ezekiel",
    "Ez": "Ezekiel", "Dn": "Daniel",
    "Dan": "Daniel", "Hos": "Hosea", "Jl": "Joel", "Am": "Amos",
    "Ob": "Obadiah", "Jon": "Jonah", "Mi": "Micah", "Na": "Nahum",
    "Hb": "Habakkuk", "Zep": "Zephaniah", "Hg": "Haggai", "Zec": "Zechariah",
    "Mal": "Malachi", "Mt": "Matthew", "Mk": "Mark", "Lk": "Luke",
    "Jn": "John", "Ac": "Acts", "Acts": "Acts", "Rom": "Romans", "1 Cor": "1 Corinthians",
    "2 Cor": "2 Corinthians", "Gal": "Galatians", "Eph": "Ephesians",
    "Phil": "Philippians", "Col": "Colossians", "1 Thes": "1 Thessalonians",
    "2 Thes": "2 Thessalonians", "1 Tm": "1 Timothy", "2 Tm": "2 Timothy",
    "1 Tim": "1 Timothy", "2 Tim": "2 Timothy", "Ti": "Titus",
    "Phlm": "Philemon", "Heb": "Hebrews", "Jas": "James", "1 Pt": "1 Peter",
    "2 Pt": "2 Peter", "1 Pet": "1 Peter", "2 Pet": "2 Peter", "1 Jn": "1 John",
    "2 Jn": "2 John", "3 Jn": "3 John", "Jude": "Jude", "Rv": "Revelation",
    "Rev": "Revelation",
}

MONTHS = {
    "JANUARY": 1, "FEBRUARY": 2, "MARCH": 3, "APRIL": 4, "MAY": 5,
    "JUNE": 6, "JULY": 7, "AUGUST": 8, "SEPTEMBER": 9, "OCTOBER": 10,
    "NOVEMBER": 11, "DECEMBER": 12,
}

DAY_HEAD = re.compile(
    r"^(\d{1,2})\s+(MON|TUE|WED|THU|FRI|SAT|SUN)\b\s*(.*)$", re.IGNORECASE
)
MONTH_HEAD = re.compile(r"^([A-Z]{3,9})\s+(\d{4})\s*$")
COLOURS = ("white", "violet", "red", "green", "black", "rose")
READINGS = re.compile(r"^(.+?)\s+\((\d+)\)\s*(Pss\s+.+)?$")
# A readings line may carry more than one lectionary number, so the spec runs
# up to the last one: `.../Jn 20:1-9 (42) or Mt 28:1-10 (41)   Pss Prop`.
# The lectionary number can carry a letter, or a note: "(690A)",
# "(572A, see USCCB.org/motherofthechurch)".
READING_LINE = re.compile(r"^(.+)\s+\((\d+[A-Za-z]?[^)]{0,40})\)(.*)$")
# The verses may contain spaces after a comma, an "or" giving the
# alternative from another Mass, and the em dash the PDF uses for a range.
CITATION = re.compile(r"^([1-3]?\s?[A-Z][a-z]+)\s+([\d:,\-–— A-Za-z;]+)$")

GOSPEL_BOOKS = {"Matthew", "Mark", "Luke", "John"}

EPISTLE_BOOKS = {
    "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians",
    "Ephesians", "Philippians", "Colossians", "1 Thessalonians",
    "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon",
    "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John",
    "Jude", "Revelation",
}

GOSPEL_BOOKS = ("Matthew", "Mark", "Luke", "John")

# The lectionary numbers its psalms I to IV, which are the four Sunday
# responsorials of the three-year cycle. "Prop" means the day keeps its own
# proper psalm.
LECTIONARY_PSALMS = {"I": "100", "II": "95", "III": "98", "IV": "51"}


def is_gospel(citation: str) -> bool:
    return citation.split(" ")[0].strip() in GOSPEL_BOOKS


def strip_lectionary_number(text: str) -> str:
    """`Jn 20:1-9 (42)` -> `John 20:1-9`."""
    return re.sub(r"\s*\(\d+\)\s*$", "", text.strip())


def expand_book(abbrev: str) -> str:
    key = re.sub(r"\s+", " ", abbrev.strip())
    if key in BOOKS:
        return BOOKS[key]
    # "Pss" for the responsorial.
    if key.startswith("Ps"):
        return "Psalm"
    return key


def expand_citation(citation: str) -> str:
    """`Gn 12:1-4a` -> `Genesis 12:1-4a`."""
    match = CITATION.match(citation.strip())
    if not match:
        return citation.strip()
    book = expand_book(match.group(1))
    verses = match.group(2).replace("—", "-").replace("–", "-")
    return f"{book} {verses}"


def split_readings(spec: str) -> list:
    """`Gn 12:1-4a/2 Tm 1:8b-10/Mt 17:1-9` -> three expanded citations."""
    parts = [p.strip() for p in spec.split("/") if p.strip()]
    out = []
    for part in parts:
        text = strip_lectionary_number(expand_citation(part))
        # A Mass may be named before the reading: "Evening Mass of the Lord's
        # Supper: Ex 12:1-8". The label is not part of the citation.
        text = re.sub(r"^(?:[A-Za-z][A-Za-z' ]*?):\s*", "", text)
        out.append(text)
    return out


RANKS = (
    "solemnity",
    "feast",
    "memorial",
    "optional memorial",
    "holyday of obligation",
)


def looks_like_readings(spec: str) -> bool:
    """True when the line is a set of citations rather than a footnote.

    A reading begins with a book — "1 Jn 2:18-21", "Mk 5:21-43" — while a
    numbered footnote begins with prose: "5 The following readings may be used
    on any Lenten day this week...". A Mass label ("Day:", "Vigil:") may come
    first.
    """
    # A Mass may be named before the readings: "Day: Is 52:7-10/...",
    # "Evening Mass of the Lord's Supper: Ex 12:1-8/...". The label is words
    # and spaces; a book and its verses are not.
    spec = re.sub(r"^(?:[A-Za-z][A-Za-z' ]*?):\s*", "", spec.strip())
    first = spec.split("/")[0].strip()
    match = re.match(r"^([1-3]?\s?[A-Za-z]+)", first)
    if not match:
        return False
    return match.group(1).strip() in BOOKS


def is_noise(line: str) -> bool:
    """Footnote and appendix text that is not part of the day's title.

    The calendars carry numbered notes after the days. When a day's readings
    are set a little further down the page, those notes would otherwise be
    swallowed into the name of the day.
    """
    if re.match(r"^\d+\s+\S", line):
        # "1 Jn 2:18-21" is a citation; "5 The following readings..." is a
        # footnote. Only the latter is noise.
        return not looks_like_readings(line)
    lowered = line.lower()
    for phrase in (
        "if necessary", "the following", "although not given",
        "nine readings are assigned", "the chrism mass",
        "may be used on any", "see usccb", "weekdays i", "weekdays ii",
        "year a ", "year b ", "year c ",
    ):
        if phrase in lowered:
            return True
    return False


def parse_cycles(text: str):
    """The cycles in force, as stated in the calendar."""
    flat = re.sub(r"[ \t]+", " ", text)
    cycles = []
    pattern = re.compile(
        r"Sunday Cycle\s+YEAR ([ABC])\s+([A-Za-z]+ \d{1,2}, \d{4})\s+to\s+"
        r"([A-Za-z]+ \d{1,2}, \d{4})"
    )
    for match in pattern.finditer(flat):
        cycles.append(
            {
                "sundayCycle": match.group(1).lower(),
                "from": match.group(2),
                "to": match.group(3),
                "weekdayCycle": None,
            }
        )
    # The weekday cycle applies to the stretches of Ordinary Time of the first
    # cycle the calendar covers; the next one is stated in the next calendar.
    weekday = re.search(r"Weekday Cycle\s+CYCLE\s+(I{1,2}|1|2)\b", flat)
    if weekday and cycles:
        token = weekday.group(1).upper()
        cycles[0]["weekdayCycle"] = "1" if token in ("I", "1") else "2"
    return cycles


def parse_pdf(path: str):
    from pypdf import PdfReader

    reader = PdfReader(path)
    pages = []
    for page in reader.pages:
        pages.append(page.extract_text() or "")
    text = "\n".join(pages)
    del pages

    lines = [ln.strip() for ln in text.split("\n")]

    days = {}
    # The cycles are stated on their own page near the front of the calendar.
    cycles = parse_cycles(text)
    month = None
    year = None
    i = 0

    while i < len(lines):
        line = lines[i]
        i += 1
        if not line:
            continue

        month_match = MONTH_HEAD.match(line)
        if month_match and month_match.group(1).upper() in MONTHS:
            month = MONTHS[month_match.group(1).upper()]
            year = int(month_match.group(2))
            continue

        head = DAY_HEAD.match(line)
        if not head or month is None or year is None:
            continue

        day = int(head.group(1))
        dow = head.group(2)
        rest = head.group(3)

        # The celebration and the colour may be on this line or the next.
        celebration = rest
        colour = None
        for candidate in COLOURS:
            if candidate in celebration.lower():
                colour = candidate
                celebration = re.sub(
                    candidate, "", celebration, flags=re.IGNORECASE
                ).strip()
                break

        # The name of the day, its rank, and any optional memorials kept on
        # it. Nothing else belongs to the day.
        notes: list[str] = []

        # Collect the following lines until the readings are found. A day may
        # carry several sets — Christmas has a Vigil, a Night, a Dawn and a Day
        # Mass — and the Day Mass is the one the app shows.
        readings_lines = []
        while i < len(lines):
            nxt = lines[i]
            i += 1
            if not nxt:
                continue
            if DAY_HEAD.match(nxt) or MONTH_HEAD.match(nxt):
                i -= 1
                break
            reading_match = READING_LINE.match(nxt)
            if reading_match:
                spec_text = reading_match.group(1)
                # "Any readings from no. 668 or from the Masses for the Dead" —
                # the day is kept, with no readings of its own.
                if spec_text.strip().lower().startswith("any readings"):
                    readings_lines.append(nxt)
                    continue
                if looks_like_readings(spec_text):
                    readings_lines.append(nxt)
                    continue
            if nxt.startswith("[") and nxt.endswith("]"):
                # An optional memorial kept on the day.
                notes.append(nxt.strip())
                continue
            if is_noise(nxt):
                continue
            if nxt.lower().strip() in RANKS:
                celebration = f"{celebration} {nxt.strip()}"
                continue
            # Anything else is not part of the name of the day.

        if not readings_lines:
            continue

        # A day may carry several sets of readings — Christmas has a Vigil, a
        # Night, a Dawn and a Day Mass. The Day Mass is the one the app shows.
        candidates = []
        for line in readings_lines:
            match = READING_LINE.match(line)
            if not match:
                continue
            # The Chrism Mass footnote is not a reading of the day.
            if match.group(1).strip().lower().startswith("chrism mass"):
                continue
            spec = match.group(1).strip()
            label = ""
            labelled = re.match(r"^([A-Za-z]+):\s*(.+)$", spec)
            if labelled:
                label = labelled.group(1)
                spec = labelled.group(2).strip()
            candidates.append(
                {
                    "label": label,
                    "spec": spec,
                    "number": match.group(2),
                    "psalm": match.group(3).strip() or None,
                }
            )

        if not candidates:
            continue

        chosen = None
        for candidate in candidates:
            if candidate["label"].lower() == "day":
                chosen = candidate
                break
        if chosen is None:
            for candidate in candidates:
                if not candidate["label"]:
                    chosen = candidate
                    break
        if chosen is None:
            chosen = candidates[0]

        spec = re.sub(r"\s*\(\d+\)", "", chosen["spec"])

        # Some days have no appointed readings of their own: All Souls is
        # celebrated with any of the Masses for the Dead.
        if spec.lower().startswith("any readings"):
            spec = ""

        number = chosen["number"]
        psalm = chosen["psalm"]
        citations = split_readings(spec)

        # Palm Sunday lists the entrance Gospel as well as the Mass readings.
        if (
            len(citations) >= 4
            and is_gospel(citations[0])
            and is_gospel(citations[-1])
        ):
            citations = citations[1:]

        # The readings are listed in order: First Reading, Second Reading,
        # Gospel — or, on a weekday, just First Reading and Gospel. Two
        # exceptions need handling. Palm Sunday also lists the entrance
        # Gospel before the Mass readings, and some days list the psalm
        # inline between the First Reading and the Second.
        citations = list(citations)

        if (
            len(citations) >= 4
            and is_gospel(citations[0])
            and is_gospel(citations[-1])
        ):
            citations = citations[1:]

        psalm_inline = None
        if len(citations) >= 4 and citations[1].split(" ")[0] == "Psalm":
            psalm_inline = citations[1]
            citations = citations[:1] + citations[2:]

        first = second = gospel = None
        if len(citations) >= 3:
            first, second, gospel = citations[0], citations[1], citations[2]
        elif len(citations) == 2:
            first, gospel = citations[0], citations[1]
        elif len(citations) == 1:
            first = citations[0]

        key = f"{year:04d}-{month:02d}-{day:02d}"
        psalm_number = None
        if psalm:
            token = psalm.replace("Pss", "").strip()
            psalm_number = LECTIONARY_PSALMS.get(token.upper())
        if psalm_inline:
            psalm_number = psalm_inline

        if notes:
            celebration = f"{celebration.strip()} {' '.join(notes)}"

        days[key] = {
            "date": key,
            "weekday": dow.upper(),
            "celebration": celebration.strip(),
            "colour": colour,
            "raw": spec,
            "firstReading": first,
            "psalm": f"Psalm {psalm_number}" if psalm_number else None,
            "secondReading": second,
            "gospel": gospel,
            "lectionaryNumber": number,
        }


    return {"cycles": cycles, "days": days}


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)

    pdf_dir = sys.argv[1]
    out_path = sys.argv[2]

    result = {}
    for name in sorted(os.listdir(pdf_dir)):
        if not name.startswith("usccb-") or not name.endswith(".pdf"):
            continue
        year = name[6:-4]
        path = os.path.join(pdf_dir, name)
        try:
            parsed = parse_pdf(path)
        except Exception as exc:  # noqa: BLE001
            print(f"  {year}: FAILED {exc}")
            continue
        if not parsed["days"]:
            print(f"  {year}: no days found")
            continue
        result[year] = parsed
        print(f"  {year}: {len(parsed['days'])} days, cycles={parsed['cycles']}")

    with open(out_path, "w", encoding="utf-8") as handle:
        json.dump(result, handle, indent=1, ensure_ascii=False)

    print(f"wrote {out_path} ({len(result)} calendar years)")


if __name__ == "__main__":
    main()
