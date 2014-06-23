﻿
(function() {
    var dataviz = kendo.dataviz,
        diagram = dataviz.diagram,

        g = dataviz.geometry,
        d = dataviz.drawing,

        Point = diagram.Point,
        Rect = diagram.Rect,
        Rotation = diagram.Rotation,
        CompositeTransform = diagram.CompositeTransform;


    (function() {
        var Element = diagram.Element;
        var element;
        var drawingElement;

        function elementSetup(options) {
            element = new Element(options);

            drawingElement = new d.Element();
            element.drawingElement = drawingElement;
        }

        module("Element", {
            setup: function() {
                elementSetup({
                    foo: "bar",
                    id: "foo"
                });
            }
        });

        test("sets id", function() {
            equal(element.id, "foo");
        });

        test("inits options", function() {
            equal(element.options.foo, "bar");
        });

        test("inits origin size", function() {
            ok(element._originSize instanceof Rect);
        });

        test("inits transformation ", function() {
            ok(element._transform instanceof CompositeTransform);
        });

        test("visible returns drawing element visibility", function() {
            equal(element.visible(), drawingElement.visible());
        });

        test("visible sets drawing element visibility", function() {
            element.visible(false);
            equal(drawingElement.visible(), false);
        });

        test("redraw sets id", function() {
            element.redraw({
                id: "test"
            });
            equal(element.id, "test");
        });

        test("position returns point with current position", function() {
            var options = element.options;
            options.x = 1;
            options.y = 2;
            var position = element.position();
            ok(position instanceof Point);
            equal(position.x, 1);
            equal(position.y, 2);
        });

        test("position sets new translate position", function() {
            element.position(1, 2);
            var translate = element._transform.translate;
            equal(translate.x, 1);
            equal(translate.y, 2);
        });

        test("position renders new translate position", function() {
            element.position(1, 2);
            var matrix = drawingElement.transform().matrix();
            equal(matrix.e, 1);
            equal(matrix.f, 2);
        });

        test("position sets new translate position when a point is passed as parameter", function() {
            element.position(new Point(1,2));
            var translate = element._transform.translate;
            equal(translate.x, 1);
            equal(translate.y, 2);
        });

        test("position renders new translate position when a point is passed as parameter", function() {
            element.position(new Point(1,2));
            var matrix = drawingElement.transform().matrix();
            equal(matrix.e, 1);
            equal(matrix.f, 2);
        });

        test("position sets position to options", function() {
            var options = element.options;
            element.position(1, 2);
            equal(options.x, 1);
            equal(options.y, 2);
            element.position(new Point(3, 4));
            equal(options.x, 3);
            equal(options.y, 4);
        });

        test("rotate returns current rotation", function() {
            element._transform.rotate = new Rotation(45, 100, 200);
            var rotation = element.rotate();
            equal(rotation.x, 100);
            equal(rotation.y, 200);
            equal(rotation.angle, 45);
        });

        test("rotate sets rotation", function() {
            element.rotate(45, new Point(100, 200));
            var rotation = element._transform.rotate;
            equal(rotation.x, 100);
            equal(rotation.y, 200);
            equal(rotation.angle, 45);
        });

        test("rotate renders rotation", function() {
            element.rotate(45, new Point(100, 200));
            var tolerance = 0.001;
            var matrix = drawingElement.transform().matrix();
            close(matrix.a, 0.707, tolerance);
            close(matrix.b, 0.707, tolerance);
            close(matrix.c, -0.707, tolerance);
            close(matrix.d, 0.707, tolerance);
            close(matrix.e, 170.711, tolerance);
            close(matrix.f, -12.132, tolerance);
        });

        // ------------------------------------------------------------

        var rawRect = new Rect(100, 200, 100, 50)

        module("Element / measure", {
            setup: function() {
                elementSetup({});
                drawingElement.rawBBox = function() {
                    return new g.Rect(new g.Point(100,200), new g.Point(200, 250));
                };
            }
        });

        test("_measure returns raw bounding rect", function() {;
            var rect = element._measure();
            ok(rect.equals(rawRect));
        });

        test("_measure sets origin fields", function() {;
            var rect = element._measure();
            ok(element._originSize.equals(rawRect));
            equal(element._originWidth, 100);
            equal(element._originHeight, 50);
        });

        test("_measure sets _measured to true", function() {;
            var rect = element._measure();
            equal(element._measured, true);
        });

        test("_measure returns current bounding rect if element has been measured", function() {;
            element._measure();
            drawingElement.rawBBox = function() {
                return new g.Rect(new g.Point(50,60), new g.Point(100, 100));
            };
            var rect = element._measure();
            ok(rect.equals(rawRect));
        });

        test("_measure recalculates raw bounding rect if element has been measured but true is passed as parameter", function() {
            element._measure();
            drawingElement.rawBBox = function() {
                return new g.Rect(new g.Point(50,60), new g.Point(100, 100));
            };
            var rect = element._measure(true);
            ok(rect.equals(new Rect(50, 60, 50, 40)));
        });

    })();

    (function() {
        var VisualBase = diagram.VisualBase;
        var visualBase;
        var drawingElement;

        var ShapeMock = d.Element.extend({
            stroke: function(color, width, opacity) {
                var stroke = this.options.stroke = this.options.stroke || {};
                if (color) {
                    stroke.color = color;
                }
                if (width) {
                    stroke.width = width;
                }
                if (opacity) {
                    stroke.opacity = opacity
                }
            },

            fill: function(color, opacity) {
                var fill = this.options.fill = this.options.fill || {};
                if (color) {
                    fill.color = color;
                }
                if (opacity) {
                    fill.opacity = opacity
                }
            }
        });

        module("VisualBase", {
            setup: function() {
                visual = new VisualBase({
                    fill: {
                        color: "red"
                    },
                    stroke: {
                        color: "green"
                    }
                });
            }
        });

        test("inits fill color", function() {
            equal(visual.options.fill.color, new dataviz.Color("red").toHex());
        });

        test("inits stroke color", function() {
            equal(visual.options.stroke.color, new dataviz.Color("green").toHex());
        });

        // ------------------------------------------------------------
        module("VisualBase / api", {
            setup: function() {
                visual = new VisualBase({
                    fill: {
                        color: "blue",
                        opacity: 1
                    },
                    stroke: {
                        color: "blue",
                        width: 1,
                        opacity: 1
                    }
                });
                drawingElement = new ShapeMock();
                visual.drawingElement = drawingElement;
            }
        });

        test("fill updates fill options", function() {
            visual.fill("red", 0.5);
            var fill =  visual.options.fill;
            equal(fill.color, "#ff0000");
            equal(fill.opacity, 0.5);
        });

        test("fill renders new fill options", function() {
            visual.fill("red", 0.5);
            var fill =  drawingElement.options.fill;
            equal(fill.color, "#ff0000");
            equal(fill.opacity, 0.5);
        });

        test("stroke updates stroke options", function() {
            visual.stroke("red", 2, 0.5);
            var stroke =  visual.options.stroke;
            equal(stroke.color, "#ff0000");
            equal(stroke.width, 2);
            equal(stroke.opacity, 0.5);
        });

        test("stroke renders new stroke options", function() {
            visual.stroke("red", 2, 0.5);
            var stroke =  drawingElement.options.stroke;

            equal(stroke.color, "#ff0000");
            equal(stroke.width, 2);
            equal(stroke.opacity, 0.5);
        });

        test("redraw sets fill options", function() {
            visual.redraw({
                fill: {
                    color: "red",
                    opacity: 0.5
                }
            });
            var fill = visual.options.fill;

            equal(fill.color, "#ff0000");
            equal(fill.opacity, 0.5);
        });

        test("redraw renders fill options", function() {
            visual.redraw({
                fill: {
                    color: "red",
                    opacity: 0.5
                }
            });
            var fill = drawingElement.options.fill;

            equal(fill.color, "#ff0000");
            equal(fill.opacity, 0.5);
        });

        test("redraw does not render fill if no fill options are passed", 0, function() {
            drawingElement.fill = function() {
                ok(false);
            };
            visual.redraw();
        });

        test("redraw sets stroke options", function() {
            visual.redraw({
                stroke: {
                    color: "red",
                    width: 2,
                    opacity: 0.5
                }
            });
            var stroke = visual.options.stroke;

            equal(stroke.color, "#ff0000");
            equal(stroke.width, 2);
            equal(stroke.opacity, 0.5);
        });

        test("redraw renders stroke options", function() {
            visual.redraw({
                stroke: {
                    color: "red",
                    width: 2,
                    opacity: 0.5
                }
            });
            var stroke = drawingElement.options.stroke;

            equal(stroke.color, "#ff0000");
            equal(stroke.width, 2);
            equal(stroke.opacity, 0.5);
        });

        test("redraw does not render stroke if no stroke options are passed", 0, function() {
            drawingElement.stroke = function() {
                ok(false);
            };
            visual.redraw();
        });

        test("_hover renders hover fill if true is passed as parameter and visual has hover fill options", function() {
            visual.options.hover = {
                fill: {
                    color: "#ff0000",
                    opacity: 0.7
                }
            };
            visual._hover(true);
            var fill = drawingElement.options.fill;

            equal(fill.color, "#ff0000");
            equal(fill.opacity, 0.7);
        });

        test("_hover does not update fill options", function() {
            visual.options.hover = {
                fill: {
                    color: "red",
                    opacity: 0.7
                }
            };
            visual._hover(true);
            var fill = visual.options.fill;

            equal(fill.color, "#0000ff");
            equal(fill.opacity, 1);
        });

        test("_hover does not render fill if true is passed as parameter but visual has no hover fill options", 0, function() {
            drawingElement.fill = function() {
                ok(false);
            };
            visual._hover(true);
        });

        test("_hover renders visual fill options if false is passed as parameter and visual has hover fill options", function() {
            visual.options.hover = {
                fill: {
                    color: "#ff0000",
                    opacity: 0.7
                }
            };
            drawingElement.fill = function(color, opacity) {
                equal(color, "#0000ff");
                equal(opacity, 1);
            };
            visual._hover(false);
        });

        test("_hover does not render fill if false is passed as parameter and visual has no hover fill options", 0, function() {
            drawingElement.fill = function() {
                ok(false);
            };
            visual._hover(false);
        });

    })();

})();
