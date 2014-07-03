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

func (r *Rectangle) In(p *Point) bool {
    return p.X >= r.LeftTop.X && p.X <= r.RightBottom.X &&
        p.Y >= r.LeftTop.Y && p.Y <= r.RightBottom.Y
}

func (r *Rectangle) StrongIn(p *Point) bool {
    return p.X > r.LeftTop.X && p.X < r.RightBottom.X &&
        p.Y > r.LeftTop.Y && p.Y < r.RightBottom.Y
}

func (r *Rectangle) CrossedBySegment(s *Segment) bool {
    return r.In(&s.Point1) || r.In(&s.Point2)
}

func (r *Rectangle) RightTop() *Point {
    return MakePoint(r.RightBottom.X, r.LeftTop.Y)
}

func (r *Rectangle) LeftBottom() *Point {
    return MakePoint(r.LeftTop.X, r.RightBottom.Y)
}

func (r *Rectangle) InRect(rect *Rectangle) bool {
    return r.StrongIn(&rect.LeftTop) || r.StrongIn(&rect.RightBottom) ||
        r.StrongIn(rect.LeftBottom()) || r.StrongIn(rect.RightTop())
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
