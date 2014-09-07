package geometry

import (
    "math"
)

type Point struct {
    X, Y float64
}

func (p *Point) Move(dx, dy float64) {
    p.X += dx
    p.Y += dy
}

func MakePoint(x, y float64) *Point {
    return &Point{x, y}
}

type Rectangle struct {
    LeftTop, RightBottom Point
} 

type Segment struct {
    Point1, Point2 Point
}

func MakeSegment(x1, y1, x2, y2 float64) *Segment {
    return &Segment{Point{x1, y1}, Point{x2, y2}}
}

func MakeSegmentByPoints(p1, p2 *Point) *Segment {
    return &Segment{*p1, *p2}
}

func (s *Segment) Middle() *Point {
    return MakePoint((s.Point1.X + s.Point2.X) / 2, (s.Point1.Y + s.Point2.Y) / 2)
}

func between(l, r, x float64) bool {
    return l <= x && x <= r
}

func (s *Segment) On(p *Point) bool {
    return between(math.Min(s.Point1.X, s.Point2.X), math.Max(s.Point1.X, s.Point2.X), p.X) &&
        between(math.Min(s.Point1.Y, s.Point2.Y), math.Max(s.Point1.Y, s.Point2.Y), p.Y)
}

func (s *Segment) CrossedBySegment(other *Segment) bool {
    d1 := direction(&other.Point1, &other.Point2, &s.Point1)
    d2 := direction(&other.Point1, &other.Point2, &s.Point2)
    d3 := direction(&s.Point1, &s.Point2, &other.Point1)
    d4 := direction(&s.Point1, &s.Point2, &other.Point2)
    if ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0)) {
        return true
    } else if d1 == 0 && other.On(&s.Point1) {
        return true
    } else if d2 == 0 && other.On(&s.Point2) {
        return true
    } else if d3 == 0 && s.On(&other.Point1) {
        return true
    } else if d4 == 0 && s.On(&other.Point2) {
        return true
    } else {
        return false
    }
}

func (r *Rectangle) In(p *Point) bool {
    return p.X >= r.LeftTop.X && p.X <= r.RightBottom.X &&
        p.Y >= r.LeftTop.Y && p.Y <= r.RightBottom.Y
}

func (r *Rectangle) StrongIn(p *Point) bool {
    return p.X > r.LeftTop.X && p.X < r.RightBottom.X &&
        p.Y > r.LeftTop.Y && p.Y < r.RightBottom.Y
}

func direction(p0, p1, p2 *Point) float64 {
    return (p1.X - p0.X) * (p2.Y - p0.Y) - (p2.X - p0.X) * (p1.Y - p0.Y)
}

func (r *Rectangle) CrossedBySegment(s *Segment) bool {
    return r.In(&s.Point1) || r.In(&s.Point2) ||
        s.CrossedBySegment(MakeSegmentByPoints(&r.LeftTop, r.LeftBottom())) ||
        s.CrossedBySegment(MakeSegmentByPoints(&r.LeftTop, r.RightTop())) ||
        s.CrossedBySegment(MakeSegmentByPoints(&r.RightBottom, r.RightTop())) ||
        s.CrossedBySegment(MakeSegmentByPoints(&r.RightBottom, r.LeftBottom()))
}

func (r *Rectangle) StrongCrossedBySegment(s *Segment) bool {
    return r.StrongIn(&s.Point1) || r.StrongIn(&s.Point2) ||
        r.StrongIn(s.Middle())
}

func (r *Rectangle) RightTop() *Point {
    return MakePoint(r.RightBottom.X, r.LeftTop.Y)
}

func (r *Rectangle) LeftBottom() *Point {
    return MakePoint(r.LeftTop.X, r.RightBottom.Y)
}

func (r *Rectangle) InRect(rect *Rectangle) bool {
    return r.StrongIn(&rect.LeftTop) || r.StrongIn(&rect.RightBottom) ||
        r.StrongIn(rect.LeftBottom()) || r.StrongIn(rect.RightTop()) ||
        r.StrongIn(MakePoint(rect.LeftTop.X + 0.5, rect.LeftTop.Y + 0.5))
}

func (r *Rectangle) CrossedByRect(rect *Rectangle) bool {
    return r.InRect(rect) || rect.InRect(r)
}

func MakeRectangle(lt, rb *Point) *Rectangle {
    return &Rectangle{*lt, *rb}
}

func Distance(p1, p2 Point) float64 {
    return math.Sqrt((p1.X - p2.X) * (p1.X - p2.X) + (p1.Y - p2.Y) * (p1.Y - p2.Y))
}
